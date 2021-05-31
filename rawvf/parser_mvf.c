/*****************************************************************
 Original script by Maksim Bashov 2014-04-18.
 
 Modified during 2019-02 by Damien Moore. Add Time and Status to Clone 
 0.97 videos and deactivated several sections of code written for earlier
 versions but using incorrect assumptions. Changed 3bvs calculation to
 truncate instead of round.
 
 Modified by Damien Moore 2020-01-26. Rewrote the readmvf() function to
 correctly parse earlier versions. Program can now parse 8 different video
 formats: 2007, 2006, 0.97, 0.97 Funny Mode, 0.97 Unknown Hack, 0.8 to 0.96, 
 0.76, and 0.75 or earlier. Tidied up code and wrote comments. This is being 
 released as Clone (MVF) RAW version 6.   
 
 Note Clone 2007 (not this program) has a bug where the day sometimes does not
 save correctly resulting in a value of 00. Also, Clone 0.97 beta sometimes 
 saves the time 0.01s different than the actual end time per last mouse event.
*****************************************************************/

#include <stdio.h>
//Note that the version of math.h used depends on compiler
//You need to append -lm to your compile command
#include <math.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include <stdarg.h>
#include <emscripten.h>

#ifndef EM_PORT_API
#	if defined(__EMSCRIPTEN__)
#		include <emscripten.h>
#		if defined(__cplusplus)
#			define EM_PORT_API(rettype) extern "C" rettype EMSCRIPTEN_KEEPALIVE
#		else
#			define EM_PORT_API(rettype) rettype EMSCRIPTEN_KEEPALIVE
#		endif
#	else
#		if defined(__cplusplus)
#			define EM_PORT_API(rettype) extern "C" rettype
#		else
#			define EM_PORT_API(rettype) rettype
#		endif
#	endif
#endif

#define ERR_TOO_LARGE	          1	/* Too large video */
#define ERR_INVALID_FILE	      2	/* Invalid file */
#define ERR_UNEXPECTED_END	      3	/* Unexpected end of file */
#define ERR_INVALID_BOARD_SIZE	  4	/* Invalid board size */
#define ERR_INVALID_MINE_POSITION 5	/* Invalid mine position */

#define MAXREP 100000
#define MAXNAME 1000
#define MAXEV 10

struct event
{
    int sec,ths;
    int x,y;
    int lb,rb,mb;	
    int weirdness_bit; //Versions before 0.97 have an extra byte in each event
};
typedef struct event event;

unsigned char *MVF;

//Initialise global variables
int mode,level,w,h,m;						//Mode, Level, Width, Height, Mines
int size; 									//Number of game events
int* board;									//Array to store board cells
int qm;										//Questionmarks
int has_date;								//TRUE if Clone 0.97, 2006, 2007
char timestamp[MAXNAME];					//Timestamp
int month,year,day,hour,minute,second;		//Date variables taken from Timestamp
int has_info;								//TRUE if Clone 0.97
int bbbv,lcl,rcl,dcl,solved_bbbv;			//Stats only available in Clone 0.97 videos
int score_sec,score_ths;					//Time in seconds and decimals
char name[MAXNAME];							//Player name
const char program[]="Minesweeper Clone";	//Program defined here instead of reading from video
char *version;								//Version
event video[MAXREP];						//Game events
const int square_size=16;					//Cell size used in mouse movement calculations
float bbbvs;								//3bvs
long length;					            //File byte data length
long position;				                //Current processed byte index



//==============================================================================================
//Function to return formatted results, imp by C, call by JavaScript
//==============================================================================================
EM_PORT_API(void) onprogress(const char *result);


//==============================================================================================
//Function to callback success message, imp by C, call by JavaScript
//==============================================================================================
EM_PORT_API(void) onsuccess();


//==============================================================================================
//Function to callback error message, imp by C, call by JavaScript
//==============================================================================================
EM_PORT_API(void) onerror(const int error_code, const char *error_msg);


//==============================================================================================
//Function to free memory
//==============================================================================================
void freememory()
{
	if (NULL != board)
	{
		free(board);
		board = NULL;
	}
}


//==============================================================================================
//Function to return formatted results
//==============================================================================================
void writef(char *format, ...)
{
	char str[MAXNAME];
	va_list args;
	va_start(args, format);
	vsprintf(str, format, args);
	onprogress(str);
	va_end(args);
}


//==============================================================================================
//Function to proxy fseek
//==============================================================================================
void _fseek(unsigned char *stream, long offset, int whence)
{
    if (SEEK_SET == whence)
    {
        position = offset;
    }
    else if (SEEK_CUR == whence)
    {
        position += offset;
    }
    else if (SEEK_END == whence)
    {
        position = length + offset;
    }
}


//==============================================================================================
//Function to proxy ftell
//==============================================================================================
long _ftell(unsigned char *stream)
{
    return position;
}


//==============================================================================================
//Function to print error messages
//==============================================================================================
void error(const int code, const char* msg)
{
	freememory();
    onerror(code, msg);
    exit(1);
}



//==============================================================================================
//Functions to parse either 1, 2 or 3 bytes at a time
//==============================================================================================
int _fgetc(unsigned char *f)
{
    if (position < length)
    {
        return f[position++];
    }
    else
    {
        error(ERR_UNEXPECTED_END, "Unexpected end of file");
        exit(1);
    }
}

int getint2(unsigned char *f)
{
    unsigned char c[2];
    c[0]=_fgetc(f);c[1]=_fgetc(f);
	//This code reads 2 bytes and puts them in a 4 byte int
	//You cannot "add" bytes in the normal sense, instead you perform shift operations
	//Multiplying by 256 is the same as shifting left by 1 byte (8 bits)
	//The result is c[0] is moved to int byte 3 while c[1] stayes in int byte 4	
    return (int)c[1]+c[0]*256;
}

int getint3(unsigned char *f)
{
    unsigned char c[3];
    c[0]=_fgetc(f);c[1]=_fgetc(f);c[2]=_fgetc(f);
    return (int)c[2]+c[1]*256+c[0]*65536;
}



//==============================================================================================
//Function to read board layout into memory
//==============================================================================================
void read_board(int add)
{
    unsigned char c;
    int board_sz,i,pos;
    w=_fgetc(MVF);h=_fgetc(MVF);
	
    board=(int*)malloc((board_sz=w*h)*sizeof(int));
    for(i=0;i<board_sz;++i) board[i]=0;
	
	//Get number of Mines
    c=_fgetc(MVF);m=c<<8;
    c=_fgetc(MVF);m+=c;
	
    for(i=0;i<m;++i)
    {
        c=_fgetc(MVF);pos=c+add;
        c=_fgetc(MVF);pos+=(c+add)*w;
        if(pos>=board_sz || pos<0) error(ERR_INVALID_MINE_POSITION,"Invalid mine position");
        board[pos]=1;
    }   
}



//==============================================================================================
//Functions to read mouse events
//==============================================================================================

//Put event bytes into e variable
void read_event(int size,unsigned char* e)
{
    int i;
    for(i=0;i<size;++i) e[i]=_fgetc(MVF);
}

//Time
void read_score()
{
    unsigned char c,d;
    c=_fgetc(MVF);d=_fgetc(MVF);
    score_sec=c*256+d;
    score_ths=10*_fgetc(MVF);
}

//Decode event
int apply_perm(int num,int* byte,unsigned char* bit,unsigned char* event)
{
    return (event[byte[num]]&bit[num])?1:0;
}


//==============================================================================================
//Function to read Clone 0.97 videos
//==============================================================================================
int read_097()
{
	//Initialise local variables
    unsigned char c;
    int len,i,j,cur;
    double leading;
    double num1,num2,num3;
    char s[41];
    int byte[40];
    unsigned char bit[40];
    const int mult=100000000;
    unsigned char e[5];
    
	//Clone 0.97 has Date (Timestamp)
    has_date=has_info=1;

    //Read Date (Timestamp)
    month=(c=_fgetc(MVF));
    day=(c=_fgetc(MVF));
    year=getint2(MVF);
    hour=_fgetc(MVF);
    minute=_fgetc(MVF);
    second=_fgetc(MVF);

    //Next 2 bytes are Level and Mode
    level=_fgetc(MVF);
    mode=_fgetc(MVF);

    //Next 3 bytes are Time
    read_score();

    //Next 11 bytes provide stats only available to Clone 0.97
    bbbv=getint2(MVF);    		//3bv
    solved_bbbv=getint2(MVF);	//Solved 3bv
    lcl=getint2(MVF);			//Left clicks
    dcl=getint2(MVF);			//Double clicks
    rcl=getint2(MVF);			//Right clicks
	
	//Check if Questionmark option was turned on
    qm=_fgetc(MVF);

    //Function gets Width, Height and Mines then reads board layout into memory
    read_board(-1);
    
    //Byte before Player gives length of name
    len=_fgetc(MVF);
    for(i=0;i<len;++i) name[i]=_fgetc(MVF);
    name[len]=0;
    
    //First 2 bytes determine the file permutation
    leading=getint2(MVF);
    num1=sqrt(leading);
    num2=sqrt(leading+1000.0);
    num3=sqrt(num1+1000.0);
    sprintf(s,"%08d",(int)(lrint(fabs(cos(num3+1000.0)*mult))));
    sprintf(s+8,"%08d",(int)(lrint(fabs(sin(sqrt(num2))*mult))));
    sprintf(s+16,"%08d",(int)(lrint(fabs(cos(num3)*mult))));
    sprintf(s+24,"%08d",(int)(lrint(fabs(sin(sqrt(num1)+1000.0)*mult))));
    sprintf(s+32,"%08d",(int)(lrint(fabs(cos(sqrt(num2+1000.0))*mult))));
    s[40]=0;
    cur=0;
    for(i='0';i<='9';++i)
        for(j=0;j<40;++j)
            if(s[j]==i)
            {
                byte[cur]=j/8;
                bit[cur++]=1<<(j%8);
            }
			
	//Get number of bytes that store mouse events		
    size=getint3(MVF);
    if(size>=MAXREP) error(ERR_TOO_LARGE,"Too large video");
	
	//Read mouse events
    for(i=0;i<size;++i)
    {
        read_event(5,e);

        video[i].rb=apply_perm(0,byte,bit,e);
        video[i].mb=apply_perm(1,byte,bit,e);
        video[i].lb=apply_perm(2,byte,bit,e);
        video[i].x=video[i].y=video[i].ths=video[i].sec=0;
        for(j=0;j<9;++j)
        {
            video[i].x|=(apply_perm(12+j,byte,bit,e)<<j);
            video[i].y|=(apply_perm(3+j,byte,bit,e)<<j);
        }
        for(j=0;j<7;++j) video[i].ths|=(apply_perm(21+j,byte,bit,e)<<j);
        video[i].ths*=10;
        for(j=0;j<10;++j) video[i].sec|=(apply_perm(28+j,byte,bit,e)<<j);
    }
    return 1;
}


//==============================================================================================
//Function to read Clone 2006 and 2007 videos
//==============================================================================================
int read_2007()
{
	//Initialise local variables	
    unsigned char c;
    int len,i,j,cur;
    int leading;
    double num1,num2,num3,num4;
    char s[49];
    int byte[48];
    unsigned char bit[48];
    const int mult=100000000;
    unsigned char e[6];

	//Clone 2006 and 2007 have Date (Timestamp)    
    has_date=1;has_info=0;

    //Read Date (Timestamp)
    month=(c=_fgetc(MVF));
    day=(c=_fgetc(MVF));
    year=getint2(MVF);
    hour=_fgetc(MVF);
    minute=_fgetc(MVF);
    second=_fgetc(MVF);

    //Next 2 bytes are Level and Mode
    level=_fgetc(MVF);
    mode=_fgetc(MVF);

    //Next 3 bytes are Time
    score_ths=getint3(MVF);
    score_sec=score_ths/1000;
    score_ths%=1000;

	//Check if Questionmark option was turned on
    qm=_fgetc(MVF);

    //Function gets Width, Height and Mines then reads board layout into memory
    read_board(-1);

    //Byte before Player gives length of name
    len=_fgetc(MVF);
    if(len>=MAXNAME) len=MAXNAME-1;
    for(i=0;i<len;++i) name[i]=_fgetc(MVF);
    name[len]=0;
    
    //First 2 bytes determine the file permutation
    leading=getint2(MVF);
    num1=sqrt(leading);
    num2=sqrt(leading+1000.0);
    num3=sqrt(num1+1000.0);
    num4=sqrt(num2+1000.0);
    sprintf(s,"%08d",(int)(lrint(fabs(cos(num3+1000.0)*mult))));
    sprintf(s+8,"%08d",(int)(lrint(fabs(sin(sqrt(num2))*mult))));
    sprintf(s+16,"%08d",(int)(lrint(fabs(cos(num3)*mult))));
    sprintf(s+24,"%08d",(int)(lrint(fabs(sin(sqrt(num1)+1000.0)*mult))));
    sprintf(s+32,"%08d",(int)(lrint(fabs(cos(num4)*mult))));
    sprintf(s+40,"%08d",(int)(lrint(fabs(sin(num4)*mult))));
    s[48]=0;
    cur=0;
    for(i='0';i<='9';++i)
        for(j=0;j<48;++j)
            if(s[j]==i)
            {
                byte[cur]=j/8;
                bit[cur++]=1<<(j%8);
            }
			
	//Get number of bytes that store mouse events				
    size=getint3(MVF);
    if(size>=MAXREP) error(ERR_TOO_LARGE,"Too large video");
	
	//Read mouse events	
    for(i=0;i<size;++i)
    {
        read_event(6,e);
        
        video[i].rb=apply_perm(0,byte,bit,e);
        video[i].mb=apply_perm(1,byte,bit,e);
        video[i].lb=apply_perm(2,byte,bit,e);
        video[i].x=video[i].y=video[i].ths=video[i].sec=0;
        for(j=0;j<11;++j)
        {
            video[i].x|=(apply_perm(14+j,byte,bit,e)<<j);
            video[i].y|=(apply_perm(3+j,byte,bit,e)<<j);
        }
        for(j=0;j<22;++j) video[i].ths|=(apply_perm(25+j,byte,bit,e)<<j);
        video[i].sec=video[i].ths/1000;
        video[i].ths%=1000;
        video[i].x-=32;
        video[i].y-=32;
    }
    return 1;
}



//==============================================================================================
//Function to check version and parse if not standard Clone 0.97, 2006 or 2007
//==============================================================================================
int readmvf()
{   
	//Initialise local variables	   
    unsigned char c,d;    
    size=0;
    c=_fgetc(MVF);
    d=_fgetc(MVF);
	
	//Perform version checks
	//Prior to Clone 0.97 first 2 bytes were Width and Height (so 08,10,1E) 
	//Early versions also did not allow Custom videos to be saved in Legal Mode
    if(c==0x11 && d==0x4D)
    {
		//The byte after offset 27 in "new" versions is last digit of year
        _fseek(MVF,27,SEEK_SET);
        c=_fgetc(MVF);
		
		//Clone 0.97		
        if(c=='5')
        {
            //Relevant data starts from offset 74
            _fseek(MVF,74,SEEK_SET);
            version="0.97 beta";
            return read_097();
        }
		//Clone 2006 or 2007
        else if(c=='6' || c=='7')
        {
            _fseek(MVF,53,SEEK_SET);
            c=_fgetc(MVF);
            version=(char*)malloc(c+1);
            for(d=0;d<c;++d) version[d]=_fgetc(MVF);
            version[d]=0;
            //Relevant data starts from offset 71
            _fseek(MVF,71,SEEK_SET);
            return read_2007();
        }
		//Clone 0.97 Funny Mode hack by Abiu in June 2008
        else if(c=='8')
        {
            //Relevant data starts from offset 74			
            _fseek(MVF,74,SEEK_SET);
            version="0.97 Funny Mode Hack";
            c=read_097();
			//All Funny Mode videos are UPK
            mode=3;
            return c;
        }
    }
	//Clone 0.97 hack by an unknown person
    else if (c==0x00 && d==0x00)
    {
        _fseek(MVF,7,SEEK_SET);
        version="0.97 Unknown Hack";
        return read_097();
    }
	//Clone 0.96 and earlier versions do not have a header
	//Clone 0.76 introduced 100 bytes for the Player name (default is 'Minesweeper Clone')	
	//Clone 0.76 and earlier end with 10 bytes containing a numeric Checksum
	//Clone 0.8 replaced 10 byte checksum with 22 bytes (00, 20 byte Checksum, 00)
	//The 3 bytes before Player name and Checksum are the Time	
    else
    {
		//Initialise local variables	
        unsigned char e[8];
        unsigned char last;
        int i;
        long filesize,current,after_events;
        int has_name;

		//There is no header so read from start of file
        _fseek(MVF,0,SEEK_SET);
		
		//Function reads Width, Height, Mines and the X,Y for each Mine
        read_board(0);
		
		//Check if Questionmark option was turned on
        qm=c=_fgetc(MVF);
		
		//Throw away byte
        c=_fgetc(MVF);
		
		//Store current byte position for later when reading mouse events
		current=_ftell(MVF);
		
		//Get number of bytes in file
		_fseek(MVF,0,SEEK_END);
		filesize=_ftell(MVF);

		//Check if 20 byte checksum is bookended by zero
        _fseek(MVF,filesize-1,SEEK_SET);
		char checksum_a = _fgetc(MVF);
        _fseek(MVF,filesize-22,SEEK_SET);
		char checksum_b = _fgetc(MVF);		

		if(isdigit(checksum_a)==0 && isdigit(checksum_b)==0)
		{
			version = "0.96 beta (or earlier)";	

			//Set pointer to get Time later
			after_events=filesize-125;			
			
			//Get Player name
			_fseek(MVF,filesize-122,SEEK_SET);
			for(i=0;i<100;++i) name[i]=_fgetc(MVF);		
		}
		else
		{
			//Assumption is last 3 bytes of 100 byte of Player name are blank			
			_fseek(MVF,filesize-13,SEEK_SET);
			
			if(_fgetc(MVF)==' ' && _fgetc(MVF)==' ' && _fgetc(MVF)==' ')	
			{
				version = "0.76 beta";
				
				//Set pointer to get Time later
				after_events=filesize-113;

				//Get Player name
				_fseek(MVF,filesize-110,SEEK_SET);
				for(i=0;i<100;++i) name[i]=_fgetc(MVF);
			}
			else
			{
				version = "0.75 beta (or earlier)";
				
				//Set pointer to get Time later				
				after_events=filesize-13;
				
				char name=' ';							
			}	
		}
		
		//Early versions did not have Date (Timestamp)
        has_info=has_date=0;
		
		//Early versions only have Classic Mode
        mode=1;
		
		//Get Width and Height
        if(w==8 && h==8) level=1;
        else if(w==16 && h==16) level=2;
        else if(w==30 && h==16) level=3;
        else error(ERR_INVALID_BOARD_SIZE,"Invalid board size");

		//Get Time (3 bytes)
        _fseek(MVF,after_events,SEEK_SET);
        read_score();
		
		//Read mouse events	
        _fseek(MVF,current,SEEK_SET);
        while(current<=after_events)
        {
            read_event(8,e);
                        
            video[size].sec=e[0];
            video[size].ths=e[1]*10;

            if(size>0 && 
            (video[size].sec<video[size-1].sec || 
            (video[size].sec==video[size-1].sec && video[size].ths<video[size-1].ths))) 
            {
                break;
            }
            if(video[size].sec>score_sec ||
            (video[size].sec==score_sec && video[size].ths>score_ths))
            {
                break;
            }
            
            video[size].lb=e[2]&0x01;
            video[size].mb=e[2]&0x02;
            video[size].rb=e[2]&0x04;
            video[size].x=(int)e[3]*256+e[4];
            video[size].y=(int)e[5]*256+e[6];
            video[size++].weirdness_bit=e[7];
            current+=8;
            if(size>=MAXREP) error(ERR_TOO_LARGE,"Too large video");
        }

        video[size].lb=video[size].mb=video[size].rb=0;
        video[size].x=video[size-1].x;
        video[size].y=video[size-1].y;
        video[size].sec=video[size-1].sec;
        video[size].ths=video[size-1].ths;
        ++size;
        if(size>=MAXREP) error(ERR_TOO_LARGE,"Too large video");
        return 1;
    }
    return 0;
}


//==============================================================================================
//Function to print first mouse event
//==============================================================================================

//Clone does not save mouse events before timer starts (on button release)
//This creates the missing button press by cloning details from the first event
void print_first_event(event* e)
{
    char* ev=0;
    if(e->lb) ev="lc";
    if(e->rb) ev="rc";
    if(e->mb) ev="mc";
    if(!ev) ev="mv";
    writef("%d.%03d %s %d %d (%d %d)\n",
            e->sec,e->ths,  
            ev,
            e->x/square_size+1,e->y/square_size+1,
            e->x,e->y);
}


//==============================================================================================
//Function to print rest of mouse events
//==============================================================================================
void print_event(event* e,event* prev_e)
{
    int num_events=0,i;
    char* evs[MAXEV];

    if(e->x!=prev_e->x || e->y!=prev_e->y) evs[num_events++]="mv";
    if(e->lb && !prev_e->lb) evs[num_events++]="lc";
    if(e->rb && !prev_e->rb) evs[num_events++]="rc";
    if(e->mb && !prev_e->mb) evs[num_events++]="mc";
    if(!e->lb && prev_e->lb) evs[num_events++]="lr";
    if(!e->rb && prev_e->rb) evs[num_events++]="rr";
    if(!e->mb && prev_e->mb) evs[num_events++]="mr";

    for(i=0;i<num_events;++i)
    {       
        writef("%d.%03d %s %d %d (%d %d)\n",
                e->sec,e->ths,  
                evs[i],
                e->x/square_size+1,e->y/square_size+1,
                e->x,e->y);
    }
}



//==============================================================================================
//Function to print video data
//==============================================================================================
void writetxt()
{
	//Initialise local variables	
    int i,j;
    const char* level_names[]={"","Beginner","Intermediate","Expert","Custom","Custom"};
    const char* mode_names[]={"","Classic","Density","UPK","Cheat"};    
    if(level>5) level=5;
    if(mode>4) mode=4;
	
	//Code version and Program	    
	writef("RawVF_Version: 6\n");
    writef("Program: %s\n",program);
	
	//Print Version	
    writef("Version: %s\n",version);
	
	//Print Player		
    writef("Player: %s\n",name);
	
	//Print grid details 	
    writef("Level: %s\n",level_names[level]);
    writef("Width: %d\n",w);
    writef("Height: %d\n",h);
    writef("Mines: %d\n",m);

	//Print Marks   
    if(!qm) writef("Marks: Off\n");
    else {writef("Marks: On\n");}

	//Print Time
    writef("Time: %d.%03d\n",score_sec,score_ths);

    //Print additional stats only available to Clone 0.97 videos
    if(has_info)
    {
		//Print 3bv
        writef("BBBV: %d\n",bbbv);

		//Print 3bvs (this truncates instead of rounds)
        bbbvs=(bbbv*1000000)/((score_sec*1000)+(score_ths));
        bbbvs=bbbvs/1000;
        writef("BBBVS: %.3f\n",bbbvs);
        writef("Solved3BV: %d\n",solved_bbbv);

		//Print Status
        if(bbbv==solved_bbbv)
        writef("Status: Won\n");
        else {writef("Status: Lost\n");}

		//Print Left Clicks, Right Clicks, Double Clicks
        writef("LClicks: %d\n",lcl);
        writef("RClicks: %d\n",rcl);
        writef("DClicks: %d\n",dcl);
     }

	//Date (Timestamp) is only available in Clone 0.97 and later versions
    if(has_date) 
    {
		//Clone 2007 has a bug where sometimes it saves the day as 00
        if(day)
            writef("Timestamp: %d-%02d-%02d %02d:%02d:%02d\n",year,month,day,hour,minute,second);
        else
            writef("Timestamp: %d-%02d-?? %02d:%02d:%02d\n",year,month,hour,minute,second);
    }

	//Print Mode
    writef("Mode: %s\n",mode_names[mode]);
   
	//Print Board
    writef("Board:\n");
    for(i=0;i<h;++i)
    {
        for(j=0;j<w;++j)
            if(board[i*w+j])
                writef("*");
            else
                writef("0");
        writef("\n");
    }

    //Print mouse events
    writef("Events:\n");
    writef("0.000 start\n");
    print_first_event(video);
    for(i=1;i<size;++i)
    {
        print_event(video+i,video+i-1);
    }
    
}


//==============================================================================================
//Function to parse file data, imp by C, call by JavaScript
//==============================================================================================
EM_PORT_API(void) parser_mvf(const long len, unsigned char *byte_array)
{
	position = 0;
	length = len;
	MVF = byte_array;

	//Error if video parsing fails
	if (!readmvf())
	{
		error(ERR_INVALID_FILE, "Invalid MVF");
		return;
	}

	//Callback results and free memory
	writetxt();
	freememory();
	onsuccess();
}

