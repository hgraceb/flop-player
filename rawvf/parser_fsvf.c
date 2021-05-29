/*****************************************************************
 Original script by Maksim Bashov 2012-10-23 for both Arbiter and Freesweeper.

 Modified by ShenJia Zhang 2013-11-11. Added Time and 3BV.

 Modified during 2019-02 by Damien Moore. Added ELSE statements so Mode and Marks 
 always print (so same number of lines in output), changed Version code to work with 
 older versions and to retrieve the third part if it exists (i.e., 0.52.3 or 0.45 
 DEBUG), added Style and BBBVS variables and tested parser with all versions since 
 0.43 demo3. On 2019-02-22 fixed issue caused by Custom games having more bytes in 
 the header. On 2019-02-24 fixed bug caused when score_ths has a leading zero. Also 
 fixed errors with Time rounding versus truncating to 3 decimal places.
 
 Modified by Damien Moore 2020-01-24. Corrected minor error where the leading empty 
 space in third part of Version was being deleted. Tidied up code and wrote comments. 
 Modified 2020-02-07 to make backwards compatible to 0.35. This is being released as 
 FreeSweeper RAW version 6.
 
 Modified by Damien 2021-05-25 to split Freesweeper code from Arbiter code due to
 differences between the programs. Note that Freesweeper only saves Classic videos
 in FSVF. All other modes only save in RAW format so it is not possible to test if
 this parser correctly reads Density, Cheat, UPK, etc videos.
*****************************************************************/

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAXREP 100000
#define MAXNAME 1000

struct event
{
	//Seconds, hundredths, thousandths
	int sec,hun,ths;
	int x,y;
	int mouse;
};
typedef struct event event;


FILE* FSVF;

//Initialise global variables
int mode,w,h,m;					//Mode, Width, Height, Mines
int size;						//Number of game events
int* board;						//Stores board and mine locations
int qm;							//Questionmarks
int ver,l,ll,ls;				//Version and 3 types of cheating
int fs;							//This identifies Freesweeper videos
char name[MAXNAME];				//Player name
char skin[MAXNAME];				//Skin
char program[MAXNAME];			//Program
char value[MAXNAME];			//Used in getpair() function
char timestamp_a[MAXNAME];		//Timestamp (when game started)
char customdata[MAXNAME];		//Custom games have 4 extra bytes
event video[MAXREP];			//Game events	
int score_sec,score_ths;		//Final time in seconds and decimals
char version[MAXNAME];			//Substring used to fetch Version
int bbbv;						//3bv
float bbbvs;					//3bvs



//==============================================================================================
//Function asks user to exit after program has run successfully
//==============================================================================================
void pause()
{
	//fprintf(stderr,"Press enter to exit\n");
	//while(getchar()!='\n');
}


//==============================================================================================
//Function is run if there is a parsing error
//==============================================================================================

_fgetc(FILE* f)
{
	if(!feof(f)) 
	{
		return fgetc(f); 
	}
	else
	{
		printf("Error 4: Unexpected end of file\n");		
		exit(1);
	}
}


//==============================================================================================
//Function is used to read Realtime and Skin values
//==============================================================================================
void getpair(FILE* f,char* c1,char* c2)
{
	//Initialise local variables
	int i=0;
	char c=0;

	while(c!=':' && c!=13 && i<MAXNAME)
	{
		c=_fgetc(f);
		if(c=='<')
		{
			c1[i]=c2[0]=0;
			while(_fgetc(f)!=13);
			return;
		}
		c1[i++]=c;
	}
	c1[--i]=0;i=0;
	
	while(c!=13 && i<MAXNAME)
	{
		c=_fgetc(f);
		c2[i++]=c;
	}
	c2[i]=0;
}


//==============================================================================================
//Function is used to read video data
//==============================================================================================
int readfsvf()
{
	//Initialise local variables
	int i,cur=0;
	unsigned char c,d;
	//Create an 8 byte array to store data
    unsigned char cr[8];

    //This should return 0 because byte was only used by Arbiter
	c=_fgetc(FSVF);
	ver=c;
	
	//Confirm video is Freesweeper
	fs=!(ver=c);

	c=_fgetc(FSVF);ver=c;
	c=_fgetc(FSVF);l=c&0x1;ll=c&0x8;ls=c&0x10;
	c=_fgetc(FSVF);
	c=_fgetc(FSVF);

	//Fetch Mode from byte 6
	c=_fgetc(FSVF);
	mode=c-2;
	
	if(mode==1) 		
	{
		w=h=8;m=10;
	}
	else if(mode==2) 	
	{
		w=h=16;m=40;
	}
	else if(mode==3) 	
	{
		w=30;h=16;m=99;
	}
	else if(mode==4) 	
	{
		w=(c=_fgetc(FSVF))+1;
		h=(c=_fgetc(FSVF))+1;
		m=(c=_fgetc(FSVF));
		m=m*256+(c=_fgetc(FSVF));
	}
	else return 0;

    //Fetch board layout and put in memory
	board=(int*)malloc(sizeof(int)*w*h);
	for(i=0;i<w*h;++i) board[i]=0;
	for(i=0;i<m;++i)
	{
		c=_fgetc(FSVF)-1;
		d=_fgetc(FSVF)-1;
		board[c*w+d]=1;
	}

	//Clear the 8 byte array we are using to store data
	for(i=0;i<7;++i) cr[i]=0;
	
	//Search through bytes for timestamp which starts after the first '[' bracket
	while(cr[3]!='[')
	{	
	cr[0]=cr[1];cr[1]=cr[2];cr[2]=cr[3];cr[3]=_fgetc(FSVF);
	}
	cr[0]=cr[1];cr[1]=cr[2];cr[2]=cr[3];cr[3]=_fgetc(FSVF);
	
	//See if Questionmark option was turned on	
	if(cr[0]!=17 && cr[0]!=127) return 0;
	qm=(cr[0]==17);

	//Throw away the next byte (the first '[' before timestamp)
	_fgetc(FSVF);

	//Fetch timestamp
	//Timestamp_a is when game starts, Timestamp_b is when game ends   
	//Custom games add extra bytes here such as "W8H8M32" which need to be ignored
	//Freesweeper has not implemented Custom but uses the same format as Arbiter
	if(mode==4)
	{
	i=0;
	while(i<MAXNAME) if((customdata[i++]=_fgetc(FSVF))=='|')
	{customdata[--i]=0;break;}
	i=0;
	while(i<MAXNAME) if((timestamp_a[i++]=_fgetc(FSVF))=='|')
	{timestamp_a[--i]=0;break;}
	}
	else
	{
	i=0;
	while(i<MAXNAME) if((timestamp_a[i++]=_fgetc(FSVF))=='|')
	{timestamp_a[--i]=0;break;}
	}

	//Throw away bytes until you find letter B which is followed by the 3bv value
	while(_fgetc(FSVF)!='B');	
   
	//Clear the 8 byte array we are using to store data 
	for(i=0;i<7;++i) cr[i]=0;
	i=0;
	
	//Fetch 3BV
	while(c=_fgetc(FSVF))
	{
		if (c=='T') break;
		cr[i]=c;i++;
	}
	
	//Convert array string to an integer
	bbbv=atoi(cr);

	//Clear the 8 byte array we are using to store data 
	for(i=0;i<7;++i) cr[i]=0;
	i=0;

    //Fetch the seconds part of time (stop at decimal) and subtract 1s for real time
	while(c=_fgetc(FSVF))
	{
		if (c=='.'||c==',') break;
		cr[i]=c;i++;
	}

	//Convert array string to an integer	
	score_sec=atoi(cr);

	//Clear the 8 byte array we are using to store data 
	for(i=0;i<7;++i) cr[i]=0;
	i=0;

	//Fetch the decimal part of Time (3 decimal places)
	while(c=_fgetc(FSVF))
	{
		if (c==']') break;
		cr[i]=c;i++;
	}

	//Convert array string to an integer		
	score_ths=atoi(cr);

	//Clear the 8 byte array we are using to store data 
	for(i=0;i<7;++i) cr[i]=0;

	//This skips bytes until first mouse event takes place
	while(cr[2]!=1 || cr[1]>1)
	{
		cr[0]=cr[1];cr[1]=cr[2];cr[2]=_fgetc(FSVF);
	}
	for(i=3;i<8;++i) cr[i]=_fgetc(FSVF);

	//Each iteration reads one mouse event
	while(1)
	{
		video[cur].mouse=cr[0];
		video[cur].x=(int)cr[1]*256+cr[3];
		video[cur].y=(int)cr[5]*256+cr[7];
		video[cur].sec=(int)cr[6]*256+cr[2]-1;
		video[cur].hun=cr[4];
		
		if(video[cur].sec<0) break;

		for(i=0;i<8;++i) cr[i]=_fgetc(FSVF);
		++cur;
	}

	//Number of game events
	size=cur;
	
	
	//Arbiter code to find player name
	//This string (cs=) does not exist in Freesweeper but thousandths code breaks if deleted
	for(i=0;i<3;++i) cr[i]=0;
	while(cr[0]!='c' || cr[1]!='s' || cr[2]!='=')
	{
		cr[0]=cr[1];cr[1]=cr[2];cr[2]=_fgetc(FSVF);
	}	

	//Freesweeper thousandths
	for(i=0;i<cur;++i)
	{		
		video[i].ths=_fgetc(FSVF)&0xF;
	}
	for(i=0;i<17;++i) _fgetc(FSVF);	
	while(_fgetc(FSVF)!=13);

	//Initialise skin
	skin[0]=0;

	//Infinite loop until break statement is made
	while(1)
	{
    getpair(FSVF,name,value);
		//Stop grabbing pairs of data once Skin has been read
		if(value[0])
		{
			//If name is Skin then strcmp returns 0, using !strcmp returns 1
			if(!strcmp(name,"Skin"))
			{
			//The addition of 1 removes the leading whitespace
			strcpy(skin,value+1);
			}
		}
		else
      break;
	}

	//Fetch Program
	i=0;
	while(i<MAXNAME)
		if((program[i++]=_fgetc(FSVF))=='0' || (fs && program[i-1]>='0' && program[i-1]<='9'))		
		{
			if(fs) --i;
			program[--i]=0;
			break;
		}

	//Fetch next 3 bytes with version
	for(i=0;i<2;++i)
  	{
	version[i]=_fgetc(FSVF);
	}

	return 1;
}


//==============================================================================================
//Function is used to print video data
//==============================================================================================
void writetxt()
{
	//Initialise local variables
	int i,j;
	int curx,cury;
	const char* level_names[]={"null","Beginner","Intermediate","Expert","Custom"};
	const char* mode_names[]={"null","Classic","Classic","Classic","Density"};

	//Code version and Program
	printf("RawVF_Version: Rev6\n");
	printf("Program: %s\n",program);

	//Print Version details
	printf("Version: R%d\n",ver);
	
	//Print Player
	printf("Player: %s\n",name);

	//Print grid details
	printf("Level: %s\n",level_names[mode]);
	printf("Width: %d\n",w);
	printf("Height: %d\n",h);
	printf("Mines: %d\n",m);
	
	//Print Marks
	if(!qm)printf("Marks: Off\n");
	else {printf("Marks: On\n");}

	//Print Time
	printf("Time: %d.%d\n",score_sec,score_ths);

	//Print 3bv
	printf("BBBV: %d\n",bbbv);

	//Calculate 3bvs
	bbbvs=(bbbv*1000000)/((score_sec*1000)+(score_ths));
	bbbvs=bbbvs/1000;
	printf("BBBVS: %.03f\n",bbbvs);

	//Print Timestamp
	printf("Timestamp: %s\n",timestamp_a);

	//Print Mode
	if(!l) printf("Mode: %s\n",mode_names[mode]);
	else {printf("Mode: %s\n","Lucky");}

	//Print Skin
	if(skin) printf("Skin: %s\n",skin);
	else {printf("Skin: '%s\n"," ");}

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
	curx=cury=-1;

	for(i=0;i<size;++i)
	{
		if(video[i].mouse==1 && video[i].x==curx && video[i].y==cury) continue;
		curx=video[i].x;cury=video[i].y;
		
		printf("%d.%02d%01d ",video[i].sec,video[i].hun,video[i].ths);
		
		if(video[i].mouse==1)
			printf("mv ");
		else if(video[i].mouse==3)
			printf("lc ");
		else if(video[i].mouse==5)
			printf("lr ");
		else if(video[i].mouse==9)
			printf("rc ");
		else if(video[i].mouse==17)
			printf("rr ");
		else if(video[i].mouse==33)
			printf("mc ");
		else if(video[i].mouse==65)
			printf("mr ");
		else if(video[i].mouse==145)
			printf("rr ");
		else if(video[i].mouse==193)
			printf("mr ");
		else if(video[i].mouse==11)
			printf("sc ");
		else if(video[i].mouse==21)
			printf("lr ");
		printf("%d %d (%d %d)\n",video[i].x/16+1,video[i].y/16+1,video[i].x,video[i].y);
	}
}



//==============================================================================================
//Run program and display any error messages
//==============================================================================================
int main(int argc,char** argv)
{
	//Program can be run in command line as "program video.fsvf>output.txt"
	//The output file is optional if you prefer printing to screen	
	if(argc<2)
	{
		printf("Error 1: Name of input file missing\n");
		printf("Usage: %s <input fsvf> [nopause]\n",argv[0]);
		pause();
		return 0;
	}

	//Open video file
	FSVF=fopen(argv[1],"rb");

	//Error if video is not an FSVF file
	if(!FSVF)
	{
		printf("Error 2: Could not open FSVF\n");
		return 1;
	}

	//Error if video parsing fails
	if(!readfsvf())
	{
		printf("Error 3: Invalid FSVF\n");
		return 1;
	}
	
	//Print results, close file and free memory
	writetxt();
	fclose(FSVF);free(board);
	
	//Program ends with message to exit	
	if(argc==2) pause();
	return 0;
}

