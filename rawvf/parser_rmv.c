/*****************************************************************
 Original script by Maksim Bashov 2012-10-23.
 
 Modified during 2019-02 by Damien Moore. Split Program string to extract Version 
 and added Time, 3BV, 3BVS, Timestamp, Style, Questionmarks and Status. On 2019-02-24 
 fixed method for printing mouse event times. On 2019-03-04 made program backwards 
 compatible with Release 2.2 and earlier versions that have a shorter header.
 
 Modified 2020-01-25 by Damien Moore as Release 2 beta and earlier versions do not have 
 3bv, 3bvs or Timestamp values. Tidied code and wrote detailed comments. On 2020-02-03 
 fixed a major bug that caused Solved 3BV (in RAWVF2RAWVF) to be incorrect in certain
 videos. This bug occurred when using event[cur++] in the function used to create the
 missing first left click (since Viennasweeper does not record mouse event prior to the
 time starting and it is the release of the button that starts the timer). This version
 is being released as Viennasweeper (RMV) RAW version 6.
 
 Additional update 2021-05-24 per Tommy to add 3 new fields (nick, country, token) for 
 Viennasweeper 3.1. 
 
 Works on all known RMV versions but not earlier UMF files.
*****************************************************************/

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAXREP 100000
#define MAXNAME 1000

struct event
{
	int time;
	int x,y;
	unsigned char event;
};
typedef struct event event;


FILE* RMV;

//Initialise global variables
int mode,level,w,h,m;		//Mode, Level, Width, Height, Mines
int size;					//Number of game events
int* board;					//Stores board and mine locations
int qm,nf;					//Questionmarks, Style
char name[MAXNAME];			//Player name
char nick[MAXNAME];			//Player nickname
char country[MAXNAME];		//Player country
char token[MAXNAME];		//Player token
char program[MAXNAME];		//Program
char version[MAXNAME];		//Version string
char verstring[MAXNAME];	//Substring of Version
char verlength[MAXNAME];	//Substring of Version
char timestamp[MAXNAME];	//Timestamp
event video[MAXREP];		//Game events
const int square_size=16;	//Cell size used in mouse movement calculations
int score;					//Time
int score_check;			//Boolean used to check if Time found from game events
char bbbv[MAXNAME];			//3bv as a string
int bbbvint;				//3bv as an integer
int bbbvs; 					//3bvs during calculations
float bbbvs_final;			//3bvs with decimals



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
//Function is run if there is a parsing error
//==============================================================================================
_fgetc(FILE* f)
{
	if(!feof(f)) return fgetc(f); else
	{
	error("Error 4: Unexpected end of file");
	}
}



//==============================================================================================
//Functions to parse either 2, 3 or 4 bytes at a time
//==============================================================================================
int getint2(FILE* f)
{
	//Creates a string array called c holding 2 bytes
	unsigned char c[2];
	//This retrieves two bytes
	c[0]=_fgetc(f);c[1]=_fgetc(f);
	//Return ends the function and returns output to variable getint2
	//This code reads 2 bytes and puts them in a 4 byte int
	//You cannot "add" bytes in the normal sense, instead you perform shift operations
	//Multiplying by 256 is the same as shifting left by 1 byte (8 bits)
	//The result is c[0] is moved to int byte 3 while c[1] stayes in int byte 4
	return (int)c[1]+c[0]*256;
}

int getint3(FILE* f)
{
	//Creates a string array called c holding 3 bytes
	unsigned char c[3];
	c[0]=_fgetc(f);c[1]=_fgetc(f);c[2]=_fgetc(f);
	return (int)c[2]+c[1]*256+c[0]*65536;
}
int getint(FILE* f)
{
	//Creates a string array called c holding 4 bytes
	unsigned char c[4];
	int i;
	for(i=0;i<4;++i) c[i]=_fgetc(f);
	return (int)c[2]+c[3]*256+c[0]*65536+c[1]*16777216;
}



//==============================================================================================
//Function is used to print game events
//==============================================================================================
void print_event(event* e)
{
	const char* event_names[]={"","mv","lc","lr","rc","rr","mc","mr","","pressed","pressedqm","closed",
		"questionmark","flag","blast","lost","won","nonstandard","number0","number1","number2","number3",
		"number4","number5","number6","number7","number8","blast"};
	unsigned char c=e->event;
	
	//Mouse event	
	if(c<=7)
	{
		printf("%d.%03d %s %d %d (%d %d)\n",
			e->time/1000,e->time%1000,
			event_names[c],
			e->x/square_size+1,e->y/square_size+1,
			e->x,e->y);
	}
	//Board event	
	else if(c<=14 || (c>=18 && c<=27))
	{
		printf("%s %d %d\n",
			event_names[c],
			e->x,e->y);
	}
	//End event (ie, 'blast')
	else if(c<=17)
	{
		printf("%s\n",
			event_names[c]);
	}
}


//==============================================================================================
//Function is used to fetch Time and Status
//==============================================================================================
void print_event2(event* e)
{	
	const char* event_names[]={"","mv","lc","lr","rc","rr","mc","mr","","pressed","pressedqm","closed",
		"questionmark","flag","blast","lost","won","nonstandard","number0","number1","number2","number3",
		"number4","number5","number6","number7","number8","blast"};
	unsigned char c=e->event;
	
	//Mouse event
	if(c<=7)
	{
	//Put time of click into score variable
	score=e->time;
	}
	else {score=0;}

	//Win or lose status
	if(c==16||c==15)
	{
	printf("%s\n",event_names[c]);
	}
}


//==============================================================================================
//Function is used to read video data
//==============================================================================================
int readrmv()
{	
	//Initialise local variables	
	int i,j,cur=0;
	unsigned char c,d;
	const char* header_1="*rmv";
	int fs;
	int result_string_size; //Value gives string length starting at LEVEL in header
	int version_info_size; 	//Value gives string length starting at Viennasweeper in header
	int player_info_size; 	//Value gives string length starting at Name in header
	int board_size;
	int preflags_size;
	int properties_size;
	int vid_size;
	int cs_size;
	int num_player_info;
	int name_length;
	int nick_length;
	int country_length;
	int token_length;
	int num_preflags;
	int is_first_event=1;

	//Check first 4 bytes of header is *rmv
	for(i=0;i<4;++i) if(c=_fgetc(RMV)!=header_1[i]) error("No RMV header");

	//The getint2 function reads 2 bytes at a time
	//In legitimate videos byte 4=0 and byte 5=1, getint2 sum is thus 1
	if(getint2(RMV)!=1) error("Invalid video type");

	//The getint functions reads 4 bytes at a time
	fs=getint(RMV); 					//Gets byte 6-9
	result_string_size=getint2(RMV); 	//Gets bytes 10-11
	version_info_size=getint2(RMV); 	//Gets bytes 12-13
	player_info_size=getint2(RMV); 		//Gets bytes 14-15
	board_size=getint2(RMV);       		//Gets bytes 16-17
	preflags_size=getint2(RMV);   		//Gets bytes 18-19
	properties_size=getint2(RMV);  		//Gets bytes 20-21
	vid_size=getint(RMV);           	//Gets bytes 22-25
	cs_size=getint2(RMV);          		//Gets bytes 26-27
	_fgetc(RMV);						//Gets byte 28 which is a newline
	
	//Length of result_string_size starts 3 bytes before 'LEVEL' and ends on the '#' before Version
	//Version 2.2 was first to have a full length header
	//Earlier versions could have maximum header length of 35 bytes if Intermediate and 9999.99
	//This means it is Version 2.2 or later so we want to parse more of the header
	if (result_string_size>35)
	{
	//Reads last part of string after '3BV'
	for(i=0;i<result_string_size-32;++i) _fgetc(RMV);

   	//Fetch those last 3 bytes which should contain 3bv (either :xx or xxx)
   	//Note that lost games save 0 as the 3BV value
   	for(i=0;i<3;++i) bbbv[i]=_fgetc(RMV);
   	if (!isdigit(bbbv[0])) bbbv[0]=' ';
   	if (!isdigit(bbbv[1])) bbbv[1]=' ';
   	if (!isdigit(bbbv[2])) bbbv[2]=' ';

   	//Throw away some bytes to get to Timestamp
   	for(i=0;i<16;++i) _fgetc(RMV);

   	//Fetch Timestamp
   	for(i=0;i<10;++i) timestamp[i]=_fgetc(RMV);
	}
	
   	//Release 2 beta and earlier versions do not have 3bv or Timestamp	
	else
	{
	bbbv[0]='0';
	timestamp[0]='0';
   	for(i=0;i<result_string_size-3;++i) _fgetc(RMV);
	}

	//Throw away the 2 bytes '# ' before 'Vienna...'
	_fgetc(RMV);
	_fgetc(RMV);

	//Program is 18 bytes 'Vienna Minesweeper'
	for(i=0;i<18;++i) program[i]=_fgetc(RMV);
	program[i]=0;

	//Throw away the ' - '
	_fgetc(RMV);
	_fgetc(RMV);
	_fgetc(RMV);

	//Put remainder of version string into a new string
	for(i=0;i<version_info_size-22;++i) version[i]=_fgetc(RMV);
	version[i]=0;

	//Home Edition 3.0H and Scoreganizer 3.0C and later have 1 extra byte (a period) before player name
	_fgetc(RMV);

	//Check next two bytes to see if player entered Name
	num_player_info=getint2(RMV);

	//Fetch Player fields (name, nick, country, token) if they exist
	//These last 3 fields were defined in Viennasweeper 3.1 RC1
	if(num_player_info>0)
	{
		name_length=_fgetc(RMV);
		for(i=0;i<name_length;++i) name[i]=_fgetc(RMV);
		name[i]=0;
	}
	if(num_player_info>1)
	{
		nick_length=_fgetc(RMV);
		for(i=0;i<nick_length;++i) nick[i]=_fgetc(RMV);
		nick[i]=0;
	}
	if(num_player_info>2)
	{
		country_length=_fgetc(RMV);
		for(i=0;i<country_length;++i) country[i]=_fgetc(RMV);
		country[i]=0;
	}
	if(num_player_info>3)
	{
		token_length=_fgetc(RMV);
		for(i=0;i<token_length;++i) token[i]=_fgetc(RMV);
		token[i]=0;
	}

	//Throw away next 4 bytes
	getint(RMV); 

	//Get board size and Mine details
	w=_fgetc(RMV); 		//Next byte is w so 8, 9 or 1E
	h=_fgetc(RMV); 		//Next byte is h so 8, 9 or 10
	m=getint2(RMV); 	//Next two bytes are number of mines

	//Fetch board layout and put in memory
	board=(int*)malloc(sizeof(int)*w*h);
	for(i=0;i<w*h;++i) board[i]=0;

   //Every 2 bytes is x,y with 0,0 being the top left corner
	for(i=0;i<m;++i)
	{
		c=_fgetc(RMV);d=_fgetc(RMV);
		if(c>w || d>h) error("Invalid mine position");
		board[d*w+c]=1;
	}
   
	//Check number of flags placed before game started
	if(preflags_size)
	{
		num_preflags=getint2(RMV);
		for(i=0;i<num_preflags;++i)
		{
			c=_fgetc(RMV);d=_fgetc(RMV);

			video[cur].event=4;
			video[cur].x=square_size/2+c*square_size;
			video[cur].y=square_size/2+d*square_size;
			video[cur].time=0;
			cur++;

			video[cur].event=5;
			video[cur].x=square_size/2+c*square_size;
			video[cur].y=square_size/2+d*square_size;
			video[cur].time=0;
			cur++;
		}
	}	
	
	//Fetch game properties
	qm=_fgetc(RMV); 		//Value 1 if Questionmarks used, otherwise 0
	nf=_fgetc(RMV);    		//Value 1 if no Flags were used, otherwise 0
	mode=_fgetc(RMV);		//Value 0 for Classic, 1 UPK, 2 Cheat, 3 Density
	level=_fgetc(RMV);		//Value 0 for Beg, 1 Int, 2 Exp, 3 Custom                              

	//Throw away rest of properties
	for(i=4;i<properties_size;++i) _fgetc(RMV);

	//Each iteration reads one event
	while(1)
	{
		video[cur].event=c=_fgetc(RMV);++i;
		
		//Get next 4 bytes containing time of event
		if(!c)
		{
			getint(RMV);i+=4;
		}
		//Get mouse event (3 bytes time, 1 wasted, 2 width, 2 height)
		else if(c<=7)
		{
			i+=8;
			video[cur].time=getint3(RMV);
			_fgetc(RMV);
			video[cur].x=getint2(RMV)-12;
			video[cur].y=getint2(RMV)-56;
			cur++;			
			
			//Viennasweeper does not record clicks before timer starts
			//LR starts timer so the first LC is missed in the video file
			//This code generates the missing LC in that case
			//In other cases it generates a ghost event thus event[0] is empty			
			if(is_first_event)
			{
				//Global variable set to 1 so on first iteration it becomes 0				
				is_first_event=0;
				//Clone first recorded event but set missing event to LC
				video[cur].event=video[cur-1].event;
				video[cur-1].event=2;
				video[cur].time=video[cur-1].time;
				video[cur].x=video[cur-1].x;
				video[cur].y=video[cur-1].y;
				cur++;
			}
		}
		else if(c==8) error("Invalid event");
		//Get board event (ie, 'pressed' or 'number 3')
		else if(c<=14 || (c>=18 && c<=27))
		{
			i+=2;
			video[cur].x=_fgetc(RMV)+1;
			video[cur].y=_fgetc(RMV)+1;
			cur++;				
		}
		//Get game status (ie, 'won')
		else if(c<=17)
		{
			break;
		}
		else 
		{
			error("Invalid event");
		}
	}
	
	//Number of game events	
	size=cur+1;

	return 1;
}



//==============================================================================================
//Function is used to print video data
//==============================================================================================
void writetxt()
{
	//Initialise local variables	
	int i,j;
	const char* level_names[]={"Beginner","Intermediate","Expert","Custom"};
	const char* mode_names[]={"Classic","UPK","Cheat","Density"};

	//Code version and Program
	printf("RawVF_Version: Rev6\n");
	printf("Program: %s\n",program);

	//Print Version
    printf("Version: ");

	//There are several different Version string formats
	//For example, 'Vienna Minesweeper - Scoreganizer Client Edition - Release 3.0C Copyright (C) 2008-2012'
    //For example, 'Vienna Minesweeper - Home Edition - Release 3.0H Copyright (C) 2008-2012'
	//For example, 'Vienna Minesweeper - Home Edition - Release 2.2 (c)2008'
    //For example, 'Vienna Minesweeper - Home Edition - Release 2 beta.2008'

    //This fetches the Version string but stops at '(' if it exists
	for(i=0;i<sizeof(version);++i)
    {
   	if(version[i]!='(')
        verstring[i]=version[i];
     	else break;
    }

	//This deletes the word 'Copyright' from the above string
    if(verstring[strlen(verstring)-10]=='C')
    {
   	for (i=0;i<strlen(verstring)-11;++i)
		{
		verlength[i]=verstring[i];
		}
		printf("%s\n",verlength);
    }
	
	//This terminates the above string at the period for Release 2 beta and earlier
	else if(verstring[strlen(verstring)-23]=='.')
	{
   	for (i=0;i<strlen(verstring)-28;++i)
		{
		verlength[i]=verstring[i];
		}
		printf("%s\n",verlength);
	}
	
	//This is for any versions without a copyright notice or period in Version string
	else
	{
		printf("%s\n",verstring);
	}

	//Print Player 
	printf("Player: %s\n",name);
	
	//Print grid details	
	printf("Level: %s\n",level_names[level]);
	printf("Width: %d\n",w);
	printf("Height: %d\n",h);
	printf("Mines: %d\n",m);

	//Print Marks
	if(qm) printf("Marks: On\n");
    else printf("Marks: Off\n");

	//Print Time
    printf("Time: ");

	//Time is taken from the last mouse event
	//Usually this is the 3rd last printed event
	if(i=size-3)
	{
		print_event2(video+i);
		if(score!=0)
		{
			printf("%d.%03d\n",score/1000,score%1000);
			score_check=1;
		}
   }
	//Sometimes it is the 4th last printed event
	if(score_check!=1)
	{
		if(i=size-4)
		{
			print_event2(video+i);
			if(score!=0)
			{
				printf("%d.%03d\n",score/1000,score%1000);
				score_check=1;
			}
		}
	}

	//Print 3bv and 3bvs
	if(bbbv[0]!='0')
	{
		//Convert string to an integer
		bbbvint=atoi(bbbv);
		printf("BBBV: %d\n",bbbvint);
		//You need to float 3bvs int otherwise integer/integer = integer.
		bbbvs=(bbbvint*1000000)/(score);
		bbbvs_final=(float)bbbvs/1000;
		printf("BBBVS: %.03f\n",bbbvs_final);	
	}   
	//Release 2 beta and earlier do not have these values so print blank rows
	else
	{
		printf("BBBV: \n");
		printf("BBBVS: \n");		
	}	

	//Print Status
	if(i=size-1)
	{
		printf("Status: ");
		print_event2(video+i);
	}	
	
	//Print Timestamp
	if(timestamp[0]!='0')
	{
		printf("Timestamp: %s\n",timestamp);
	}
	else
	{
		printf("Timestamp: \n");
	}	

	//Print Mode
	printf("Mode: %s\n",mode_names[mode]);

	//Print Style
	if(nf) printf("Style: NF\n");
	else printf("Style: FL\n");         

	//Print Board
	printf("Board:\n");
	for(i=0;i<h;++i)
	{
		for(j=0;j<w;++j)
			if(board[i*w+j])
				printf("*");
			else
				printf("0");
		printf("\n");
	}

	//Print Mouse events
	printf("Events:\n");
	printf("0.000 start\n");
	for(i=0;i<size;++i)
	{
		print_event(video+i);
	}
}



//==============================================================================================
//Run program and display any error messages
//==============================================================================================
int main(int argc,char** argv)
{
	//Program can be run in command line as "program video.rmv>output.txt"
	//The output file is optional if you prefer printing to screen		
	if(argc<2)
	{
		printf("Error 1: Name of input file missing\n");
		printf("Usage: %s <input rmv> [nopause]\n",argv[0]);
		pause();
		return 0;
	}
	
	//Open video file	
	RMV=fopen(argv[1],"rb");

	//Error if video is not an RMV file	
	if(!RMV)
	{
		printf("Error 2: Could not open RMV\n");
		return 1;
	}

	//Error if video parsing fails
	if(!readrmv())
	{
		printf("Error 3: Invalid RMV\n");
		return 1;
	}
	
	//Print results, close file and free memory
	writetxt();
	fclose(RMV);free(board);

	//Program ends with message to exit		
	if(argc==2) pause();
	return 0;
}

