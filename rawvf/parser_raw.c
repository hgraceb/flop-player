/*****************************************************************
 Original RAWVF2RAWVF program by Maksim Bashov 2013-07-29. The program notes warned 
 "the following code is much more awful than you may expect".
 
 Program was modified by Zhou Ke (crazyks) 2014-04-18. This fixed 2 bugs in the valeq() 
 function relating to incrementing a count. It also fixed a bug where the len variable 
 was called while being defined so results were off by 1 byte.
 
 Modified by Damien Moore for a month ending 2020-02-09. Changes included:
 
 - Fixed bug where error check failed due to differences between Linux and Windows.
 - Fix bug with number events so cell co-ordinates always start from 1 instead of 0.
 - Fixed bug where check_win() printed to screen instead of selected output method.
 - Fixed bug where check_win() was not called after openings.
 - Fixed bug where qm was checked instead of !qm.
 - Removed claims_win variable as the updated Viennasweeper parser makes this redundant.
 - Renamed variables to remove confusion over hun and ths in score calculations.
 - Truncated decimals in various calculations instead of rounding.
 - Aligned event names to RAWVF version 5 standard and removed unused functionality.
 - Changed function order so now functions are logically grouped.
 - Added detailed comments throughout file.

 Program was modified by Enbin Hu (Flop) 2021-06-13. Fix the bug of not handling the
 question mark setting toggle.

 This is being released as Rawparser version 6. 
 
 Program works for Minesweeper Clone, Minesweeper Arbiter, Minesweeper X and Viennasweeper 
 in both legal and cheat modes. 
 
 The standard legal moves are LC (left click), LR (left release), RC (right click), RR
 (right release), MC (middle press) and MR (middle press). Flags and Questionmarks are
 placed and removed with a RC. The timer starts after the first cell is opened. Cells
 open after a LC-LR sequence. A Chord is when you LC and RC (in any order) then LR and
 RR (at the same time or in that order) on an open cell. If the cell contains a number 
 and touches the same number of flags additional cells touched are opened. The normal 
 chording method is to flag (RC-RR) then chord (LC-RC-LR-RR) in two motions. You can also
 chord by holding SHIFT during a LC-LR. You can also chord with a MC-MR. A fourth method 
 is to flag (RC) then slide onto a number to finish the chord (LC-LR-RR) in one motion 
 known as a 1.5 Click.
 
 Arbiter 0.44 and earlier allow an illegal move known as a Rilian Click. This occurs when 
 a chord is released on an unopened cell (instead of a number) and the LR occurs after the 
 RR. In legal game play this is a failed chord and nothing happens but a Rilian Click will 
 perform a left click and open the cell. When running this program use the -r option to
 process these correctly.
 
 Elmar Technique is possible in all official minesweeper versions. This occurs when the left
 mouse button is configured to left click on both press and release. The code in this program
 will process but not identify Elmar Technique (the variable must be set in the minesweeper
 program parser and passed to this program in the input file).
 
 Program also has code to process FreeSweeper cheat options such as Nono (where holding SHIFT 
 and LC lets you flag multiple cells by dragging the mouse over the cells like in Nonosweeper), 
 Superflag (where RC on a number will flag adjacent cells if their count is the same) and 
 Superclick (where LC on a number does a chord). The code in this program does not change the 
 value of these variables and depends on the underlying minesweeper program parser to include
 these variables in their output.
 
*****************************************************************/

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
//Note that the version of math.h used depends on compiler
//You need to append -lm to your compile command
#include <math.h>

#define MAXLEN 1000
#define MAXOPS 1000
#define MAXISLS 1000

FILE* input;
FILE* output;

//This defines cell attributes and sets 'board' as a pointer to 'cell'
//For example, calling board[i].mine calls the value of mine at that cell location
struct cell
{
	int mine;					//Value 1 if cell is a mine
	int opening; 				//Value 1 if cell belongs to an opening
	int opening2;				//Value 1 if cell belongs to a second opening
	int island;					//Value 1 if cell belongs to an island of numbers
	int number;					//Value 1 if cell is a number
	int rb,re,cb,ce; 			//See init_board() function these are used to identify cell neighbours
	int opened;					//Value 1 if cell has been opened
	int flagged,wasted_flag;	//Value 1 for both when flagged but do_chord() function returns wasted_flag to 0
	int questioned;				//Value 1 if cell has a Questionmark
	int premium;				//Variable used in ZiNi calculations to assess optimal flagging style strategy
};
typedef struct cell cell;
cell* board;

//Initiate global variables
int w,h,m,size;
int won=0;
int no_board_events=0,no_zini=0,no_rilian_clicks=1,no_check_info=0;
int bbbv,openings,islands,zini,gzini,hzini;
int l_clicks,r_clicks,d_clicks,clicks_15;
int wasted_l_clicks,wasted_r_clicks,wasted_d_clicks,wasted_clicks_15;
int rilian_clicks;
int flags,wasted_flags,unflags,misflags,misunflags;
int distance;
int solved_bbbv;
int closed_cells;
int size_ops[MAXOPS];
int size_isls[MAXISLS];
int solved_ops,solved_isls;
int left,right,middle,shift_left;
int chorded,onedotfive;
int cur_x,cur_y,cur_prec_x,cur_prec_y;
int cur_time,end_time=0;
char event[MAXLEN];
int qm;
int elmar,nono,superclick,superflag;



//==============================================================================================
//Function asks user to exit after program has run successfully
//==============================================================================================
void pause()
{
	//fprintf(stderr,"Press enter to exit\n");
	//while(getchar()!='\n');
}


//==============================================================================================
//Function to print error messages
//==============================================================================================
void error(const char* msg)
{
	fprintf(stderr,"%s\n",msg);
	pause();
	exit(1);
}


//==============================================================================================
//Functions to read key:value pairs from the input file header
//==============================================================================================

//Read key (ie, 'Level')
int opteq(const char* opt,const char* str)
{
	int i=0;
	while(opt[i]!=':' && opt[i]!=' ' && opt[i] && str[i] && tolower(opt[i])==tolower(str[i])) ++i;
	return opt[i]==':' && str[i]==0;
}

//Read value (ie, 'Intermediate)
int valeq(const char *val, const char* str)
{
	int i=0, j=0;
	while(val[i]==' ') i++;
	while(str[j] && val[i]!='\n' && val[i]!=' ' && val[i] && tolower(str[j])==tolower(val[i])) ++i,++j;
	return (val[i]=='\n' || val[i]==' ') && str[j]==0;
}


//==============================================================================================
//Functions to erase board information
//==============================================================================================

//Erase all information about cells
void clearboard()
{
	int i;
	closed_cells=size;
	for(i=0;i<size;++i)
		board[i].mine=board[i].opened=board[i].flagged=board[i].questioned=board[i].wasted_flag=
		board[i].opening=board[i].opening2=board[i].island=0;
}

//Erase all information about cell states
void restartboard()
{
	int i;
	closed_cells=size;
	for(i=0;i<size;++i)
		board[i].opened=board[i].flagged=board[i].wasted_flag=board[i].questioned=0;
}


//==============================================================================================
//Function to count mines touching a cell
//==============================================================================================
int getnumber(int index)
{
	int rr,cc;
	int res=0;
	//Check neighbourhood
	for(rr=board[index].rb;rr<=board[index].re;++rr)
		for(cc=board[index].cb;cc<=board[index].ce;++cc)
			//Increase count if cell is a mine
			res+=board[cc*h+rr].mine;
	return res;
}


//==============================================================================================
//Functions used by init_board() to determine size of Openings and Islands
//==============================================================================================

//Determine if cell belongs to 1 or 2 Openings and assign it to an Opening ID
void set_opening_border(int op_id,int index)
{
	if(!board[index].opening)
		board[index].opening=op_id;
	else if(board[index].opening!=op_id)
		board[index].opening2=op_id;
}

//Determine the size (number of cells) in the Opening
void process_opening(int op_id,int index)
{
	int rr,cc;
	++size_ops[op_id];
	board[index].opening=op_id;
	//Check neighbourhood
	for(rr=board[index].rb;rr<=board[index].re;++rr)
		for(cc=board[index].cb;cc<=board[index].ce;++cc)
		{
			int i=cc*h+rr;
			if(board[i].number && !board[i].mine)
			{
				if(board[i].opening!=op_id && board[i].opening2!=op_id) ++size_ops[op_id];
				set_opening_border(op_id,i);
			}
			else if(!board[i].opening && !board[i].mine)
				process_opening(op_id,i);
		}		
}

//Determine the size (number of cells) in the Island
void process_island(int is_id,int index)
{
	int rr,cc;
	board[index].island=is_id;
	++size_isls[is_id];
	//Check neighbourhood
	for(rr=board[index].rb;rr<=board[index].re;++rr)
		for(cc=board[index].cb;cc<=board[index].ce;++cc)
		{
			int i=cc*h+rr;
			if(!board[i].island && !board[i].mine && !board[i].opening)
				process_island(is_id,i);
		}		
}


//==============================================================================================
//Function to read board layout and count number of Openings and Islands
//==============================================================================================
void init_board()
{
	int i;
	int r,c;
	openings=0;
	
	//Determine the neighbourhood for each cell
	for(r=0;r<h;++r)
	{
		for(c=0;c<w;++c)
		{
			int index=c*h+r;
			board[index].rb = r?r-1:r;
			board[index].re = r==h-1?r:r+1;
			board[index].cb = c?c-1:c;
			board[index].ce = c==w-1?c:c+1;
		}
	}
	
	//Set initial premium for each cell (for ZiNi calculations)
	for(i=0;i<size;++i)
	{
		//Premium is used in ZiNi calculations
		//ZiNi attempts to determine the optimal flagging strategy
		//Premium tries to determine potential contribution of cell to optimal solve of game
		//The fewer clicks needed to perform a useful action (like a chord) the higher the premium
		//Mines have no premium
		//An opened cell is more useful than a closed cell
		//Each correct flag makes a number more useful		
		//A higher number is less useful because more flags are required		
		board[i].premium= -(board[i].number=getnumber(i))-2;
	}
	
	for(i=0;i<size;++i)
		if(!board[i].number && !board[i].opening)
		{
			if(++openings>MAXOPS) error("Too many openings");
			size_ops[openings]=0;
			//Send to function to determine size of Opening			
			process_opening(openings,i);
		}
		
	for(i=0;i<size;++i)
		if(!board[i].opening && !board[i].island && !board[i].mine)
		{
			if(++islands>MAXISLS) error("Too many islands");
			size_isls[islands]=0;
			//Send to function to determine size of Island
			process_island(islands,i);
		}
}


//==============================================================================================
//Function used by both the calc_bbbv() and calc_zini() functions
//==============================================================================================
int getadj3bv(int index)
{
	int res=0;
	int rr,cc;
	if(!board[index].number) return 1;
	//Check neighbourhood
	for(rr=board[index].rb;rr<=board[index].re;++rr)
		for(cc=board[index].cb;cc<=board[index].ce;++cc)
		{
			int i=cc*h+rr;
			res+=(!board[i].mine && !board[i].opening); 
		}
	//Number belongs to the edge of an opening	
	if(board[index].opening) ++res;
	//Number belongs to the edge of a second opening
	if(board[index].opening2) ++res;
	//Return number (0-9)
	return res;
}


//==============================================================================================
//Function to calculate 3bv
//==============================================================================================
void calc_bbbv()
{
	int i;
	//Start by setting 3bv equal to the number of openings
	bbbv=openings;
	for(i=0;i<size;++i)
	{
		//Increase 3bv count if it is a non-edge number
		if(!board[i].opening && !board[i].mine)	++bbbv;
		board[i].premium+=getadj3bv(i);
	}
}


//==============================================================================================
//Functions used only by the calc_zini() function
//==============================================================================================

//Open cell
void open(int index)
{
	int rr,cc;
	board[index].opened=1;
	++board[index].premium;
	
	//Check cell is a number and not on the edge of an opening
	if(!board[index].opening)
		for(rr=board[index].rb;rr<=board[index].re;++rr)
			for(cc=board[index].cb;cc<=board[index].ce;++cc)
				--board[cc*h+rr].premium;
	//Decrease count of unopened cells		
	--closed_cells;
}

//Perform checks before opening cells
void reveal(int index)
{
	//Do not open flagged or already open cells
	if(board[index].opened) return;
	if(board[index].flagged) return;

	//Open if cell is a non-zero number
	if(board[index].number) 
		open(index);
	//Cell is inside an opening (not a number on the edge)
	else
	{
		int op=board[index].opening;
		int i;
		for(i=0;i<size;++i)
		{
			if(board[i].opening2==op ||
				board[i].opening==op)
			{
				//Open all numbers on the edge of the opening
				if(!board[i].opened) open(i);
				//Reduce premium of neighbouring cells
				//Chording on neighbouring cells will no longer open this opening
				--board[i].premium;
			}
		}
	}
}

//Flag
void flag(int index)
{
	int rr,cc;
	if(board[index].flagged) return;
	++zini;
	board[index].flagged=1;
	//Check neighbourhood
	for(rr=board[index].rb;rr<=board[index].re;++rr)
		for(cc=board[index].cb;cc<=board[index].ce;++cc)
			//Increase premium of neighbouring cells
			//Placing a flag makes it 1 click more likely a chord can occur
			++board[cc*h+rr].premium;
}

//Chord
void chord(int index)
{
	int rr,cc;
	++zini;
	for(rr=board[index].rb;rr<=board[index].re;++rr)
		for(cc=board[index].cb;cc<=board[index].ce;++cc)
			reveal(cc*h+rr);
}

//Click
void click(int index)
{
	reveal(index);
	++zini;
}

//Click inside an opening (not on the edge)
void hit_openings()
{
	int j;
	for(j=0;j<size;++j)
		if(!board[j].number && !board[j].opened)
		{
			click(j);
		}
}

//Flags neighbouring mines
void flagaround(int index)
{
	int rr,cc;
	//Check neighbourhood
	for(rr=board[index].rb;rr<=board[index].re;++rr)
		for(cc=board[index].cb;cc<=board[index].ce;++cc)
		{
			int i=cc*h+rr;
			if(board[i].mine) flag(i);
		}
}



//==============================================================================================
//Function to calculate ZiNi and HZiNi
//==============================================================================================
void calc_zini()
{
	int i;
	zini=0;
	restartboard();
	
	//While non-mine cells remain unopened
	while(closed_cells>m)
	{
		int maxp=-1;
		int curi=-1;
		for(i=0;i<size;++i)
		{
			if(board[i].premium>maxp &&	!board[i].mine)
			{
				maxp=board[i].premium;
				curi=i;
			}
		}
		
		//Premium has climbed into positive territory
		if(curi!=-1)
		{	
			if(!board[curi].opened) click(curi);
			flagaround(curi);
			chord(curi);
		}
		else
		{
			for(i=0;i<size;++i)
				if(!board[i].opened && !board[i].mine &&
					(!board[i].number || !board[i].opening))
				{
					curi=i;
					break;
				}
			click(curi);
		}			
	}
	
	gzini=zini;
	
	//Start calculating HZiNi
	for(i=0;i<size;++i)
	{
		board[i].premium=-(board[i].number)-2+getadj3bv(i);;
	}
	zini=0;
	restartboard();
	hit_openings();
	
	//While non-mine cells remain unopened
	while(closed_cells>m)
	{
		int maxp=-1;
		int curi=-1;
		for(i=0;i<size;++i)
		{
			if(board[i].premium>maxp &&	!board[i].mine && board[i].opened)
			{
				maxp=board[i].premium;
				curi=i;
			}
		}
		
		//Premium has climbed into positive territory		
		if(curi!=-1)
		{	
			if(!board[curi].opened) click(curi);
			flagaround(curi);
			chord(curi);
		}
		else
		{
			for(i=0;i<size;++i)
				if(!board[i].opened && !board[i].mine &&
					(!board[i].number || !board[i].opening))
				{
					curi=i;
					break;
				}
			click(curi);
		}			
	}
	hzini=zini;
	restartboard();
}


//==============================================================================================
//Function to check if mouse location is over the board
//==============================================================================================
int is_inside_board(int x,int y)
{
	return x>=0 && x<w && y>=0 && y<h;
}


//==============================================================================================
//Functions to press cells
//==============================================================================================

//Press cell
void push(int x,int y)
{
	if(no_board_events) return;
	if(!board[x*h+y].opened && !board[x*h+y].flagged)
	{
		if(board[x*h+y].questioned)
			fprintf(output,"Cell pressed (it is a Questionmark) %d %d\n",x+1,y+1);
		else
			fprintf(output,"Cell pressed %d %d\n",x+1,y+1);
	}
}

//Check which cells to press
void push_around(int x,int y)
{
	int i,j;
	for(i=board[x*h+y].rb;i<=board[x*h+y].re;++i)
		for(j=board[x*h+y].cb;j<=board[x*h+y].ce;++j)
			push(j,i);
}


//==============================================================================================
//Functions to unpress cells (this does not open them)
//==============================================================================================

//Unpress cell
void pop(int x,int y)
{
	if(!board[x*h+y].opened && !board[x*h+y].flagged)
	{
		if(board[x*h+y].questioned)
			fprintf(output,"Cell released (it is a Questionmark) %d %d\n",x+1,y+1);
		else
			fprintf(output,"Cell released %d %d\n",x+1,y+1);
	}
}

//Check which cells to unpress
void pop_around(int x,int y)
{
	int i,j;
	for(i=board[x*h+y].rb;i<=board[x*h+y].re;++i)
		for(j=board[x*h+y].cb;j<=board[x*h+y].ce;++j)
			pop(j,i);
}


//==============================================================================================
//Functions to check Win or Lose status
//==============================================================================================
void win()
{
	end_time=cur_time;
	won=1;
}

//Print Solved 3bv
void check_win()
{
	//This fixes a rounding error. The 3f rounds to 3 decimal places.
	//Using 10,000 rounds the 4th decimal place first before 3f is calculated.
	//This has the desired effect of truncating to 3 decimals instead of rounding.
	int fix;
	float fixfloated;
	fix=(int)(cur_time)*10;
	fixfloated=(float)fix/10000;
	fprintf(stdout,"%.3f Solved 3BV: %d of %d\n",fixfloated,solved_bbbv,bbbv);
	if(bbbv==solved_bbbv) win();
}

void fail()
{
	end_time=cur_time;
	won=0;
}


//==============================================================================================
//Functions for opening cells
//==============================================================================================

//Change cell status to open
void show(int x,int y)
{
	int index=x*h+y;
	fprintf(output,"Cell opened (Number %d) %d %d\n",board[index].number,x+1,y+1);
	board[index].opened=1;
	//Increment counters if cell belongs to an opening and if this iteration opens the last cell in that opening
	if(board[index].opening) if(!(--size_ops[board[index].opening])) {++solved_ops;++solved_bbbv;}
	//Increment counters if cell belongs to another opening and this iteration opens last cell in that opening	
	if(board[index].opening2) if(!(--size_ops[board[index].opening2])) {++solved_ops;++solved_bbbv;}
}

//Check how many cells to change
void show_opening(int op)
{
	int i,j,k=0;
	for(i=0;i<w;++i) for(j=0;j<h;++j,++k) 
		if(board[k].opening==op || board[k].opening2==op) 
			if(!board[k].opened && !board[k].flagged) 
				show(i,j);
}

//Perform checks before changing cell status
void do_open(int x,int y)
{
	//Lose if cell is a mine
	if(board[x*h+y].mine)
	{
		board[x*h+y].opened=1;
		fprintf(output,"Cell opened (it is a Mine) %d %d\n",x+1,y+1); 
		fail();
	}
	else
	{
		//Check cell is inside an opening (number zero)
		if(!board[x*h+y].number) 
		{
			//Open correct number of cells			
			show_opening(board[x*h+y].opening);	
			check_win();	
		}			
		else 
		{
			//Open single cell because it is a non-zero number
			show(x,y);
			if(!board[x*h+y].opening) 
			{
				++solved_bbbv;
				//Increment count of solved islands if this is last cell of the island to be opened
				if(!(--size_isls[board[x*h+y].island])) ++solved_isls;
				check_win();
			}
		}
	}
}


//==============================================================================================
//Functions to Flag, Mark and Chord
//==============================================================================================

//Count number of adjacent flags
int flags_around(int x,int y)
{
	int i,j,res=0;
	for(i=board[x*h+y].rb;i<=board[x*h+y].re;++i)
		for(j=board[x*h+y].cb;j<=board[x*h+y].ce;++j)
			if(board[j*h+i].flagged) ++res;
	return res;
}

//Chord
void do_chord(int x,int y,int onedotfive)
{
	int wasted=1,i,j;
	//Check cell is already open and number equals count of surrounding flags
	if(board[x*h+y].number==flags_around(x,y) && board[x*h+y].opened)
	{
		//Check neighbourhood
		for(i=board[x*h+y].rb;i<=board[x*h+y].re;++i)
			for(j=board[x*h+y].cb;j<=board[x*h+y].ce;++j)
				//Lose game if cell is not flagged and is a mine
				if(board[j*h+i].mine && !board[j*h+i].flagged)
					fail();
		//Check neighbourhood		
		for(i=board[x*h+y].rb;i<=board[x*h+y].re;++i)
			for(j=board[x*h+y].cb;j<=board[x*h+y].ce;++j)
				//Open cell if not flagged and not already open
				if(!board[j*h+i].opened && !board[j*h+i].flagged)
				{
					do_open(j,i);
					wasted=0;
				}
				//Chord was successful so flag was not wasted
				else if(board[j*h+i].flagged && board[j*h+i].wasted_flag)
				{
					board[j*h+i].wasted_flag=0;
					--wasted_flags;
				}
		//Chord has been wasted		
		if(wasted)
		{
			++wasted_d_clicks;
			if(onedotfive) ++wasted_clicks_15;
		}
	}
	else
	{
		//Unpress chorded cells without opening them
		pop_around(x,y);
		++wasted_d_clicks; 
		if(onedotfive) ++wasted_clicks_15;
	}
}

//Flag
void do_set_flag(int x,int y)
{
	//Note that the wasted_flag value becomes 0 after successful chord() function
	board[x*h+y].flagged=board[x*h+y].wasted_flag=1;
	fprintf(output,"Flag %d %d\n",x+1,y+1);
	++flags;++wasted_flags;
	//Increase misflag count because cell is not a mine
	if(!board[x*h+y].mine) ++misflags;
}

//Questionmark
void do_question(int x,int y)
{
	board[x*h+y].questioned=1;
	fprintf(output,"Questionmark %d %d\n",x+1,y+1);
}

//Remove Flag or Questionmark
void do_unset_flag(int x,int y)
{
	board[x*h+y].flagged=board[x*h+y].questioned=0;
	fprintf(output,"Flag removed %d %d\n",x+1,y+1);
	//Decrease flag count, increase unflag count
	--flags;++unflags;
	//Increase misunflag count because cell is not a mine
	if(!board[x*h+y].mine) ++misunflags;
}


//Part of 'superflag' cheat function (flags neighbouring mines)
void do_flag_around(int x,int y)
{
	int i,j;
	//Check neighbourhood
	for(i=board[x*h+y].rb;i<=board[x*h+y].re;++i)
		for(j=board[x*h+y].cb;j<=board[x*h+y].ce;++j)
			if(!board[j*h+i].flagged && !board[j*h+i].opened)
				do_set_flag(j,i);
}

//Part of 'superflag' cheat function (counts unopened neighbours)
int closed_sq_around(int x,int y)
{
	int i,j,res=0;
	//Check neighbourhood	
	for(i=board[x*h+y].rb;i<=board[x*h+y].re;++i)
		for(j=board[x*h+y].cb;j<=board[x*h+y].ce;++j)
			if(!board[j*h+i].opened) ++res;
	return res;
}


//==============================================================================================
//Functions for clicking and moving the mouse
//==============================================================================================

//Function definition needed here because mouse_move() and left_click() reference each other
void mouse_move(int x,int y,int prec_x,int prec_y);

//Left click
void left_click(int x,int y,int prec_x,int prec_y)
{
	if(!left) return;
	if(x!=cur_x || y!=cur_y) mouse_move(x,y,prec_x,prec_y);
	left=0;
	if(!is_inside_board(x,y))
	{
		chorded=0;
		return;
	}
	//Chord
	if(right || shift_left || (superclick && board[x*h+y].opened))
	{
		++d_clicks;
		if(onedotfive) ++clicks_15;
		do_chord(x,y,onedotfive);
		chorded=right;
		shift_left=0;
	}
	//Left click
	else	
	{
		//Rilian click
		if(chorded)	
		{
			chorded=0;
			++rilian_clicks;
			if(no_rilian_clicks) return;
		}
		++l_clicks;
		if(!board[x*h+y].opened && !board[x*h+y].flagged) do_open(x,y); else ++wasted_l_clicks;
		chorded=0;
	}
	cur_x=x;cur_y=y;
}

//Mouse movement
void mouse_move(int x,int y,int prec_x,int prec_y)
{
	if(is_inside_board(x,y))
	{
		if((left && right) || middle || shift_left) 
		{
			if(cur_x!=x || cur_y!=y)
			{
				pop_around(cur_x,cur_y);
				push_around(x,y);
			}
		}
		else if(superclick && left && board[cur_x*h+cur_y].opened)
		{
			pop_around(cur_x,cur_y);
			if(board[x*h+y].opened)
				push_around(x,y);
			else
				push(x,y);
		}
		else if(left && !chorded)
		{
			if(cur_x!=x || cur_y!=y)
			{
				pop(cur_x,cur_y);
				push(x,y);
			}
			if(nono && (cur_x!=x || cur_y!=y))
			{
				int sl=shift_left;
				left_click(x,y,cur_x,cur_y);
				left=1;
				shift_left=sl;
			}
		}
	}
	//Distance is measured using Manhattan metric instead of Euclidean
	//Rationale is that pixels form a grid thus are not points
	distance+=abs(cur_prec_x-prec_x)+abs(cur_prec_y-prec_y);
	cur_prec_x=prec_x;cur_prec_y=prec_y;
	
	if(is_inside_board(x,y))
	{
		cur_x=x;cur_y=y;
	}
}

//Left button down
void left_press(int x,int y,int prec_x,int prec_y)
{
	if(middle) return;
	left=1;shift_left=0;
	if(!is_inside_board(x,y)) return;
	if(!right && !(superclick && board[x*h+y].opened))
		push(x,y);
	else
		push_around(x,y);
	if(elmar || nono)
	{
		left_click(x,y,prec_x,prec_y);
		left=1;
	}
	cur_x=x;cur_y=y;
}

//Chord using Shift during LC-LR
void left_press_with_shift(int x,int y,int prec_x,int prec_y)
{
	if(middle) return;
	left=shift_left=1;
	if(!is_inside_board(x,y)) return;
	push_around(x,y);
	if(elmar || nono)
	{
		left_click(x,y,prec_x,prec_y);
		left=shift_left=1;
	}
	cur_x=x;cur_y=y;
}

//Toggle question mark setting
void toggle_question_mark_setting(int x,int y,int prec_x,int prec_y)
{
	qm=!qm;
}

//Right button down
void right_press(int x,int y,int prec_x,int prec_y)
{
	if(middle) return;
	right=1;shift_left=0;
	if(!is_inside_board(x,y)) return;
	if(left) 
		push_around(x,y);
	else
	{
		if(!board[x*h+y].opened)
		{
			onedotfive=1;chorded=0;
			if(board[x*h+y].flagged)
			{
				do_unset_flag(x,y);
				if(!qm) do_question(x,y);
			}
			else
			{
				if(!qm || !board[x*h+y].questioned)
					do_set_flag(x,y);
				else
				{
					board[x*h+y].flagged=board[x*h+y].questioned=0;
					fprintf(output,"Questionmark removed %d %d\n",x+1,y+1);
				}
			}
			++r_clicks;
		}
		else if(superflag && board[x*h+y].opened)
		{
			if(board[x*h+y].number && board[x*h+y].number>=closed_sq_around(x,y))
				do_flag_around(x,y);
		}
	}
	cur_x=x;cur_y=y;
}

//Right button up
void right_click(int x,int y,int prec_x,int prec_y)
{
	if(!right) return;
	right=shift_left=0;
	if(!is_inside_board(x,y))
	{
		chorded=left;
		onedotfive=0;
		return;
	}
	//Chord
	if(left)
	{
		pop_around(cur_x,cur_y);
		do_chord(x,y,0);
		++d_clicks;
		chorded=1;
	}
	//Click did not produce a Flag or Chord	
	else
	{
		//It was a RC not the beginning of a Chord
		if(!onedotfive && !chorded)
		{
			++r_clicks;
			++wasted_r_clicks;
		}
		chorded=0;
	}
	onedotfive=0;
	cur_x=x;cur_y=y;
}

//Middle button down
void middle_press(int x,int y,int prec_x,int prec_y)
{
	//Middle button resets these boolean values
	shift_left=left=right=onedotfive=chorded=0;
	middle=1;
	if(!is_inside_board(x,y)) return;
	push_around(x,y);
}

//Middle button up
void middle_click(int x,int y,int prec_x,int prec_y)
{
	if(!middle) return;
	middle=0;
	if(!is_inside_board(x,y)) return;
	do_chord(x,y,0);
	++d_clicks;
}



//==============================================================================================
//Function to convert string to double (decimal number with high precision)
//==============================================================================================

//This is a custom function to mimic atoi but for decimals
double strtodouble(const char* str)
{
	double res=0.0;
	int cur=-1,neg=0,len=strlen(str),hop=1;
	while(str[++cur]==' ');
	if(!str[cur]) return 0.0;
	if(str[cur]=='-') 
	{
		neg=1;
		++cur;
	}
	while(cur<len && isdigit(str[cur])) {res=res*10+str[cur++]-'0';}
	if(str[cur++]!='.') return res;
	while(cur<len && isdigit(str[cur])) 
	{
		res=res*10+str[cur++]-'0';	
		hop*=10;
	}
	if(neg) res=-res;
	return res/hop;
}



//==============================================================================================
//Run program
//==============================================================================================
int main(int argc,char** argv)
{
	//Initialise local variables
	int i,r,c,opts,std=0;

	//Program can be run in command line as "program input.txt>output.txt"
	//The output file is optional if you prefer printing to screen		
	if(argc<2)
	{
		printf("Usage: rawvf2rawvf [-eirsz] [input] [output]\n");
		printf("Options:\n");
		printf(" e - do not rewrite board events\n");
		printf(" i - do not check info contained in the header\n");
		printf(" r - treat rilian clicks as left clicks\n");
		printf(" s - read from the standard input\n");
		printf(" z - do not calculate ZiNi\n");
		return 2;
	}
	
	//Set some global variables to their default value
	no_board_events=0;
	no_zini=0;
	
	//If parameter 1 has been entered apply selection when running the program
	if((opts=(argv[1][0]=='-')))
	{
		const char* v=argv[1];
		while(*v)
		{
			if(*v=='e') 		no_board_events=1;
			else if(*v=='i') 	no_check_info=1;
			else if(*v=='z') 	no_zini=1;
			else if(*v=='r') 	no_rilian_clicks=0;
			else if(*v=='s') 	std=1;
			++v;
		}
	}
	
	//If stream exists assign to 'input'
	if(std)
		input=stdin;
	else
	{
		//Read the specified input file
		input=fopen(argv[argc>=3+opts?argc-2:argc-1],"r");
		if(!input) 
		{
			//Print error to screen if file cannot be opened
			fprintf(stderr,"Can't open input file %s\n",argv[argc>=3+opts?argc-2:argc-1]);
			return 3;
		}
	}
	
	//Check if output file has been specified
	if(argc>=3+opts)
	{
		//Write to output file
		output=fopen(argv[argc-1],"w+");
		if(!output) 
		{
			//Print error to screen if file cannot be opened
			fprintf(stderr,"Can't open output file %s\n",argv[argc-1]);
			return 4;
		}
	}
	//Else print results to output file
	else output=stdout;	
	
	//Set some global variables to their default value
	qm=elmar=nono=superclick=superflag=0;
	
	//Create an array containing stats we wish to calculate
	const char* info[]={"RAW_Time","RAW_3BV","RAW_Solved3BV","RAW_3BV/s","RAW_ZiNi","RAW_ZiNi/s","RAW_HZiNi","RAW_HZiNi/s",
						"RAW_Clicks","RAW_Clicks/s",
						"RAW_LeftClicks","RAW_LeftClicks/s","RAW_RightClicks","RAW_RightClicks/s",
						"RAW_DoubleClicks","RAW_DoubleClicks/s","RAW_WastedClicks","RAW_WastedClicks/s",
						"RAW_WastedLeftClicks","RAW_WastedLeftClicks/s",
						"RAW_WastedRightClicks","RAW_WastedRightClicks/s","RAW_WastedDoubleClicks",
						"RAW_WastedDoubleClicks/s","RAW_1.5Clicks","RAW_1.5Clicks/s",
						"RAW_IOE","RAW_Correctness","RAW_Throughput","RAW_ZNE","RAW_ZNT","RAW_HZNE","RAW_HZNT",
						"RAW_Openings","RAW_Islands",
						"RAW_Flags","RAW_WastedFlags","RAW_Unflags","RAW_Misflags","RAW_Misunflags",
						"RAW_RilianClicks","RAW_RilianClicks/s"};
						
	//Initialise local variables		
	//The size of char is 4 (32 bit) or 8 (64 bit) on Linux but is 4 in both cases for Windows
	//Either way this should return the count of items in the info[] array
	const int num_info=sizeof(info)/sizeof(char*);
	int has_info[num_info];
	long ptr_info[num_info];
	int info_i[num_info];
	double info_d[num_info];
	
	//Create array with default values for each stat in the info[] array
	int int_info[]={0,1,1,0,1,0,1,0,
							1,0,
							1,0,1,0,
							1,0,1,0,
							1,0,
							1,0,1,
							0,1,0,
							0,0,0,0,0,0,0,
							1,1,
							1,1,1,1,1,
							1,0};
							
	//Set some local variables to default values					
	int check_info[num_info];	
	int ww=8,hh=8,mm=10,m_cl=1,no_mode=1;
	int square_size=16;
	int claims_win=0;
	
	//Clear some arrays related to info[]
	for(i=0;i<num_info;++i) has_info[i]=0;
	for(i=0;i<num_info;++i) check_info[i]=1&& !no_zini;
	
	//Clear some arrays related to board[]
	for(i=0;i<MAXOPS;++i) size_ops[i]=0;
	for(i=0;i<MAXISLS;++i) size_isls[i]=0;

	//Read the input file header and extract existing stats to output file (or screen)
	while(1)
	{
		int info_str=0;
		long ptr=ftell(input);
		
		//Read a line from input file and store in char event
		fgets(event,MAXLEN,input);
		
		if(feof(input)) 
		{
			error("No board\n");
		}		
		
		//Stop extracting lines once input file header reaches the board layout
		if(opteq(event,"board")) break;
		//Otherwise extract the game information
		else if(opteq(event,"width")) w=atoi(event+6);
		else if(opteq(event,"height")) h=atoi(event+7);
		else if(opteq(event,"mines")) m=atoi(event+6);
		else if(opteq(event,"marks")) qm=valeq(event+6,"on\n");
		else if(opteq(event,"level"))
		{
			const char* e=event+6;
			//Marathon is a Viennasweeper mode used in some tournaments
			if(valeq(e,"Marathon"))
				error("This program doesn't support marathon RawVF");
			else if(valeq(e,"Beginner"))
			{
				ww=hh=8;mm=10;
			}
			else if(valeq(e,"Intermediate"))
			{
				ww=hh=16;mm=40;
			}
			else if(valeq(e,"Expert"))
			{
				ww=30;hh=16;mm=99;
			}
		}
		else if(opteq(event,"Mode"))
		{
			no_mode=0;
			m_cl=valeq(event+5,"Classic");
		}
		else
			//Print any other lines in the input file header
			for(i=0;i<num_info;++i)
			{
				if(opteq(event,info[i]))
				{
					has_info[i]=1;
					ptr_info[i]=ptr+strlen(info[i])+1L;
					info_str=1;
					break;
				}
			}
		//Write	event to the output file (or screen)
		fputs(event,output);
	}
	
	//Get number of cells in the board
	board=(cell*)malloc(sizeof(cell)*(size=w*h));

	//Writes stats and if no value prints blank value
	for(i=0;i<num_info;++i)
		if(!has_info[i])
		{
			fputs(info[i],output);
			ptr_info[i]=ftell(output)+2L;	
			fputs(":           \n",output);
		}		
	
	//Reset any knowledge of cells
	clearboard();
	
	//Check which cells are mines and note them with the '*' symbol
	for(r=0;r<h;++r)
	{
		fgets(event,MAXLEN,input);
		for(c=0;c<w;++c) board[c*h+r].mine=event[c]=='*';
		//Write	board with mines to the output file (or screen)
		fputs(event,output);
	}	
	
	//Call function to get number of Openings and Islands
	init_board();
	
	//Call function to calculate 3bv
	calc_bbbv();
	
	//Call function to calculate ZiNi
	if(!no_zini) calc_zini();	
	
	//Initialise variables with default values
	solved_bbbv=distance=l_clicks=r_clicks=d_clicks=wasted_l_clicks=wasted_r_clicks=wasted_d_clicks=
	clicks_15=wasted_clicks_15=flags=wasted_flags=unflags=misflags=misunflags=rilian_clicks=0;
	left=right=middle=shift_left=chorded=onedotfive=0;
	
	//Write the game events
	while(1)
	{
		int board_event,len;
		fgets(event,MAXLEN,input);
		if(feof(input)) break;
		
		len=strlen(event);
		//Closed, Flag, Questionmark, Pressed & Pressed Questionmark, Nonstandard
		board_event=len<=2 || event[0]=='c' || event[0]=='f' || event[0]=='q' || event[0]=='p' || event[0]=='n';
		if(!no_board_events && board_event) continue;
		
		//Write	event to output file (or screen)
		fputs(event,output);
		
		//Ignore certain board events
		if(board_event) 
			continue;
		//Start (implemented in Viennasweeper)
		else if(event[0]=='s')
			continue;
		//Won (implemented in Viennasweeper)
		else if(event[0]=='w')
			claims_win=1;
		//Blast (implemented in Viennasweeper)
		else if(event[0]=='b' && event[1]=='l')
			continue;
		//Boom (implemented in Freesweeper)
		else if(event[0]=='b' && event[1]=='o')
			continue;			
		//Nonstandard (proposed in RAW standard)
		else if(event[0]=='n' && event[1]=='o')
			continue;
		
		//Mouse events and the function to call in each case
		else if(isdigit(event[0]) || event[0]=='-')
		{
			int i=(event[0]=='-'?1:0);
			void (*func)(int,int,int,int)=0;
			int x,y,neg_x,neg_y;
			
			//Get the time of the event
			cur_time=0;
			while(event[i]!='.' && i<len) cur_time=cur_time*10+event[i++]-'0';
			
			//Deal with seconds, tenths and hundredths
			cur_time=cur_time*1000+(event[i+1]-'0')*100+(event[i+2]-'0')*10;
			//Include thousandths if available
			if(isdigit(event[i+3])) cur_time+=(event[i+3]-'0');						
			
			while(event[++i]!=' ' && i<len);
			while(event[++i]==' ' && i<len);
			if(event[0]=='-') cur_time=0;
			
			//Get the type of event
			if(i+1>=len) continue;
			
			//Left button
			if(event[i]=='l')
				if(event[i+1]=='r')
					func=left_click;
				else if(event[i+1]=='c')
					func=left_press;
				else
					error("Unknown event");
				
			//Right button
			else if(event[i]=='r')
				if(event[i+1]=='r')
					func=right_click;
				else if(event[i+1]=='c')
					func=right_press;
				else
					error("Unknown event");
				
			//Mouse movement and Middle button
			else if(event[i]=='m')
				if(event[i+1]=='v')
					func=mouse_move;
				else if(event[i+1]=='r')
					func=middle_click;
				else if(event[i+1]=='c')
					func=middle_press;
				//Toggle question mark setting (implemented in MinesweeperX)
                else if(event[i+1]=='t')
					func=toggle_question_mark_setting;
				else
					error("Unknown event");

			//Start (implemented in Viennasweeper)
			else if(event[i]=='s')
				if(event[i+1]=='t') 
					continue;
				//Scrolling (proposed in RAW standard)
				else if(event[i+1]=='x' || event[i+1]=='y')
					continue;
				//Shift chord (implemented in Arbiter & Freesweeper)
				else if(event[i+1]=='c')
					func=left_press_with_shift;
				else
					error("Unknown event");
			//Won (implemented in Viennasweeper)
			else if(event[i]=='w')
				claims_win=1;
			//Blast (implemented in Viennasweeper)
			else if(event[i]=='b' && event[i+1]=='l')
				continue;
			//Boom (implemented in Freesweeper)
			else if(event[i]=='b' && event[i+1]=='o')
				continue;				
			//Nonstandard (proposed in RAW standard)
			else if(event[i]=='n' && event[i+1]=='o')
				continue;
			else
				error("Unknown event");			

			while(event[++i]!='(' && i<len);
			while(!isdigit(event[++i]) && i<len);
			neg_x=event[i-1]=='-';
			x=0;
			while(isdigit(event[i]) && i<len) x=x*10+event[i++]-'0';
			while(!isdigit(event[++i]));
			if(neg_x) x=-x;
			neg_y=event[i-1]=='-';
			y=0;
			while(isdigit(event[i]) && i<len) y=y*10+event[i++]-'0';
			if(neg_y) y=-y;
				
			func(x/square_size,y/square_size,x,y);
		}		
	}		
	
	//Set some local variables	
	if(!end_time) end_time=cur_time;
	i=0;
	int clicks=l_clicks+r_clicks+d_clicks;
	int w_clicks=wasted_l_clicks+wasted_r_clicks+wasted_d_clicks;
	int e_clicks=clicks-w_clicks;
	double coeff=(double)solved_bbbv/bbbv;
	
	//Calculate all remaining stats	
	info_d[i++]=end_time/1000.0;	
	info_i[i++]=bbbv;
	info_i[i++]=solved_bbbv;
	info_d[i++]=solved_bbbv/info_d[0];
	info_i[i++]=gzini;
	info_d[i++]=gzini*solved_bbbv/(bbbv*info_d[0]);
	info_i[i++]=hzini;
	info_d[i++]=hzini*solved_bbbv/(bbbv*info_d[0]);
	info_i[i++]=clicks;
	info_d[i]=info_i[i-1]/info_d[0];++i;
	info_i[i++]=l_clicks;
	info_d[i]=info_i[i-1]/info_d[0];++i;
	info_i[i++]=r_clicks;
	info_d[i]=info_i[i-1]/info_d[0];++i;
	info_i[i++]=d_clicks;
	info_d[i]=info_i[i-1]/info_d[0];++i;
	info_i[i++]=w_clicks;
	info_d[i]=info_i[i-1]/info_d[0];++i;
	info_i[i++]=wasted_l_clicks;
	info_d[i]=info_i[i-1]/info_d[0];++i;
	info_i[i++]=wasted_r_clicks;
	info_d[i]=info_i[i-1]/info_d[0];++i;
	info_i[i++]=wasted_d_clicks;
	info_d[i]=info_i[i-1]/info_d[0];++i;
	info_i[i++]=clicks_15;
	info_d[i]=info_i[i-1]/info_d[0];++i;
	info_d[i++]=(double)solved_bbbv/clicks;
	info_d[i++]=(e_clicks)/(double)clicks;
	info_d[i++]=(double)solved_bbbv/e_clicks;
	info_d[i++]=(double)gzini*coeff/clicks;
	info_d[i++]=(double)gzini*coeff/e_clicks;
	info_d[i++]=(double)hzini*coeff/clicks;
	info_d[i++]=(double)hzini*coeff/e_clicks;
	info_i[i++]=openings;
	info_i[i++]=islands;
	info_i[i++]=flags;
	info_i[i++]=wasted_flags;
	info_i[i++]=unflags;
	info_i[i++]=misflags;
	info_i[i++]=misunflags;
	info_i[i++]=rilian_clicks;
	info_d[i]=info_i[i-1]/info_d[0];++i;
	
	//If input file header is read and contains game Status perform the following check
	if(!no_check_info && claims_win && !won) 
		fprintf(stderr,"File contains wrong info: it says the game was won while it was not\n");

	//Write generated stats
	for(i=0;i<num_info;++i)
		//Continue until an empty info[i] value is reached
		if(!check_info[i]) continue;
		//If there is no input file header information
		else if(!has_info[i])
		{
			//This reads the output file starting from the first row of generated stats
			fseek(output,ptr_info[i],SEEK_SET);				
			
			//Print key and value pair if integer
			if(int_info[i])
				{
				fprintf(output,"%d",info_i[i]);
				}
			//Print key and value pair if decimal			
			else
				{
				//This fixes a rounding error. The 3f rounds to 3 decimal places.
				//Using 10,000 rounds the 4th decimal place first before 3f is calculated.
				//This has the desired effect of truncating to 3 decimals instead of rounding.
				int fix;
				float fixfloated;					
				fix=(int)(info_d[i]*10000);
				fixfloated=(float)fix/10000;					
				fprintf(output,"%.3f",fixfloated);		
				}
		}
		//If input file header did not exist or was intentionally not read perform error checks
		else if(!no_check_info)
		{
			int j;double d,dd;
			fseek(input,ptr_info[i],SEEK_SET);
			fgets(event,MAXLEN,input);
			if(int_info[i] && (j=atoi(event))!=info_i[i])
				fprintf(stderr,"File contains wrong info:\n %s = %d while the file claims it's %d\n",
						info[i],info_i[i],j);
			else if(!int_info[i] && (((dd=(d=strtodouble(event))-info_d[i]))>=0.001 || dd<=-0.001))
				fprintf(stderr,"File contains wrong info:\n %s = %.3f while the file claims it's %.3f\n",
						info[i],info_d[i],d);
		}
	
	free(board);
	return 0;
}

