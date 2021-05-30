/*****************************************************************
 Original script by Maksim Bashov 2012-10-23.

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
 Arbiter RAW version 6.
 
 Updated 2021-05-26 by Damien to remove legacy Freesweeper code and remove Arbiter cheat
 code as Arbiter does not allow cheat mode videos.
 
 Note Arbiter internals operate to 2 decimal places. You cannot get 3 decimal places
 by subtracting timestamp_a from timestamp_b because these timestamps do not perfectly
 match start and finish of the game timer. This versions adds a fake 0 as the third
 decimal place for consistency with the other official minesweeper versions.
 
 Tested successfully on Arbiter 0.35 and later.
*****************************************************************/

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
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


unsigned char *AVF;

//Initialise global variables
int mode,w,h,m;					//Mode, Width, Height, Mines
int size;						//Number of game events
int* board;						//Stores board and mine locations
int qm;							//Questionmarks
int ver;						//Version
char name[MAXNAME];				//Player name
char skin[MAXNAME];				//Skin (since version 0.47)
char program[MAXNAME];			//Program
char value[MAXNAME];			//Used in getpair() function
char timestamp_a[MAXNAME];		//Timestamp (when game started)
char customdata[MAXNAME];		//Custom games have 4 extra bytes
event video[MAXREP];			//Game events
int score_sec,score_hun;		//Time in seconds and decimals
char spacer;					//The period or space before 3rd part of Version
char versionend[MAXNAME];		//Substring used to fetch Version
char versionprint[MAXNAME];		//Substring used to fetch Version
int bbbv;						//3bv
float realtime;					//Realtime (since version 0.47)
float bbbvs;					//3bvs
int length;					    //File byte data length
int position;				    //Current processed byte index



//==============================================================================================
//Function is used to return formatted results, imp by C, call by JavaScript
//==============================================================================================
EM_PORT_API(void) onprogress(const char *result);


//==============================================================================================
//Function is used to callback success message, imp by C, call by JavaScript
//==============================================================================================
EM_PORT_API(void) onsuccess();


//==============================================================================================
//Function is used to callback error message, imp by C, call by JavaScript
//==============================================================================================
EM_PORT_API(void) onerror(const int error_code, const char *error_msg);


//==============================================================================================
//Function is used to free memory
//==============================================================================================
void freememory()
{
	if (NULL != AVF)
	{
		free(AVF);
		AVF = NULL;
	}
	if (NULL != board)
	{
		free(board);
		board = NULL;
	}
}

//==============================================================================================
//Function is used to return formatted results
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
//Function is run if there is a parsing error
//==============================================================================================
_fgetc(unsigned char *f)
{
	if (position < length)
	{
		return f[position++];
	}
	else
	{
		freememory();
		onerror(4, "Unexpected end of file");
		exit(1);
	}
}


//==============================================================================================
//Function is used to read Realtime and Skin values
//==============================================================================================
void getpair(unsigned char* f,char* c1,char* c2)
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
int readavf()
{
	//Initialise local variables
	int i,cur=0;
	unsigned char c,d;
	//Create an 8 byte array to store data
    unsigned char cr[8];

    //Fetch main version from byte 1
    //For example, Arbiter 0.52.2 stores 52 (Hex 34) in byte 1
	c=_fgetc(AVF);
	ver=c;

    //Throw away next 4 bytes which are not used
	for(i=0;i<4;++i) c=_fgetc(AVF);

	//Fetch Mode from byte 6
	c=_fgetc(AVF);
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
		w=(c=_fgetc(AVF))+1;
		h=(c=_fgetc(AVF))+1;
		m=(c=_fgetc(AVF));
		m=m*256+(c=_fgetc(AVF));
	}
	else return 0;

    //Fetch board layout and put in memory
	board=(int*)malloc(sizeof(int)*w*h);
	for(i=0;i<w*h;++i) board[i]=0;
	for(i=0;i<m;++i)
	{
		c=_fgetc(AVF)-1;
		d=_fgetc(AVF)-1;
		board[c*w+d]=1;
	}

	//Clear the 8 byte array we are using to store data
	for(i=0;i<7;++i) cr[i]=0;
	
	//Search through bytes for timestamp which starts after the first '[' bracket
	//Note timestamp_a only became a full timestamp (with year and month) in version 0.46.1
	while(cr[3]!='[')
	{	
	cr[0]=cr[1];cr[1]=cr[2];cr[2]=cr[3];cr[3]=_fgetc(AVF);
	}
	cr[0]=cr[1];cr[1]=cr[2];cr[2]=cr[3];cr[3]=_fgetc(AVF);
	
	//See if Questionmark option was turned on	
	if(cr[0]!=17 && cr[0]!=127) return 0;
	qm=(cr[0]==17);

	//Throw away the next byte (the first '[' before timestamp)
	_fgetc(AVF);

	//Fetch timestamp
	//Timestamp_a is when game starts, Timestamp_b is when game ends   
	//Custom games add extra bytes here such as "W8H8M32" which need to be ignored
	if(mode==4)
	{
	i=0;
	while(i<MAXNAME) if((customdata[i++]=_fgetc(AVF))=='|')
	{customdata[--i]=0;break;}
	i=0;
	while(i<MAXNAME) if((timestamp_a[i++]=_fgetc(AVF))=='|')
	{timestamp_a[--i]=0;break;}
	}
	else
	{
	i=0;
	while(i<MAXNAME) if((timestamp_a[i++]=_fgetc(AVF))=='|')
	{timestamp_a[--i]=0;break;}
	}

	//Throw away bytes until you find letter B which is followed by the 3bv value
	while(_fgetc(AVF)!='B');	
   
	//Clear the 8 byte array we are using to store data 
	for(i=0;i<7;++i) cr[i]=0;
	i=0;
	
	//Fetch 3BV
	while(c=_fgetc(AVF))
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
	while(c=_fgetc(AVF))
	{
		if (c=='.'||c==',') break;
		cr[i]=c;i++;
	}

	//Convert array string to an integer	
	score_sec=atoi(cr)-1;

	//Clear the 8 byte array we are using to store data 
	for(i=0;i<7;++i) cr[i]=0;
	i=0;

	//Fetch the decimal part of Time (2 decimal places)
	while(c=_fgetc(AVF))
	{
		if (c==']') break;
		cr[i]=c;i++;
	}

	//Convert array string to an integer		
	score_hun=atoi(cr);

	//Clear the 8 byte array we are using to store data 
	for(i=0;i<7;++i) cr[i]=0;

	//This skips bytes until first mouse event takes place
	while(cr[2]!=1 || cr[1]>1)
	{
		cr[0]=cr[1];cr[1]=cr[2];cr[2]=_fgetc(AVF);
	}
	for(i=3;i<8;++i) cr[i]=_fgetc(AVF);

	//Each iteration reads one mouse event
	while(1)
	{
		video[cur].mouse=cr[0];
		video[cur].x=(int)cr[1]*256+cr[3];
		video[cur].y=(int)cr[5]*256+cr[7];
		video[cur].sec=(int)cr[6]*256+cr[2]-1;
		video[cur].hun=cr[4];

		if(video[cur].sec<0) break;

		for(i=0;i<8;++i) cr[i]=_fgetc(AVF);
		++cur;
	}

	//Number of game events
	size=cur;

	//Clear a 4 byte array
	for(i=0;i<3;++i) cr[i]=0;
	
	//Find 'cs=' in the video file (this identifies start of text at end of video)
	while(cr[0]!='c' || cr[1]!='s' || cr[2]!='=')
	{
		cr[0]=cr[1];cr[1]=cr[2];cr[2]=_fgetc(AVF);
	}
	
	//Throw away the bytes after "cs=" but before "Realtime"
	for(i=0;i<17;++i) _fgetc(AVF);

	//Initialise skin
	skin[0]=0;

	//Infinite loop until break statement is made
    //Note that Realtime and Skin do not exist before version 0.47
	while(1)
	{
    getpair(AVF,name,value);
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
		if((program[i++]=_fgetc(AVF))=='0')
		{
			program[--i]=0;
			break;
		}

	//Start the process of fetching Version, such as '0.52.3'
	//Since we print 0 later and already fetched 52 as ver, throw away the '.52'
	i=0;
	for(i=0;i<3;++i) _fgetc(AVF);
	
	//Store next byte which will be a period or blank space depending on version
	spacer=_fgetc(AVF);		

	//Fetch 10 more bytes (this is longer than longest known last part of version)
	//Read into an array (ie, '0.52.3. Copyright' would put '3. Copyrig' in array)
	for(i=0;i<10;++i)
  	{
	versionend[i]=_fgetc(AVF);
	}

    //Second step is transfer to a different array then parse up until the period or Copyright
	//Versions since 0.43 end with a period before the Copyright notice (ie, '0.43 demo3.')
	for(i=0;i<MAXNAME;++i)
  	{
    if(versionend[i]!='.' && versionend[i]!='C')
    versionprint[i]=versionend[i];
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
	writef("RawVF_Version: Rev6\n");
	writef("Program: %s\n",program);

	//Print Version details
	//Prints first two parts of version (ie., '0.52')
	writef("Version: 0.%d",ver);

	//Prints third part of version if it exists (ie, '.3' or ' DEBUG')
	if(versionprint[0]!=' ' && spacer=='.')
	{
		writef(".%s\n",versionprint);
	}
	else if(versionprint[0]!=' '&& spacer==' ')
	{
		writef(" %s\n",versionprint);
	}
	else writef("\n");

	//Print Player
	writef("Player: %s\n",name);

	//Print grid details
	writef("Level: %s\n",level_names[mode]);
	writef("Width: %d\n",w);
	writef("Height: %d\n",h);
	writef("Mines: %d\n",m);

	//Print Marks
	if(!qm)writef("Marks: Off\n");
	else {writef("Marks: On\n");}

	//Print Time
	//If score_hun starts with a 0 the 0 is dropped to prevent a calculation bug
	realtime=((score_sec*100)+(score_hun));
	realtime=realtime/100;
	writef("Time: %.03f\n",realtime);

	//Print 3bv
	writef("BBBV: %d\n",bbbv);

	//Calculate 3bvs
	bbbvs=(bbbv*100000)/((score_sec*100)+(score_hun));
	bbbvs=bbbvs/1000;
	writef("BBBVS: %.03f\n",bbbvs);

	//Print Timestamp
	writef("Timestamp: %s\n",timestamp_a);

	//Print Mode
	writef("Mode: %s\n",mode_names[mode]);

	//Print Skin
	if(skin) writef("Skin: %s\n",skin);
	else {writef("Skin: '%s\n"," ");}

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

	//Print Mouse events
	writef("Events:\n");
	curx=cury=-1;

	for(i=0;i<size;++i)
	{
		if(video[i].mouse==1 && video[i].x==curx && video[i].y==cury) continue;
		curx=video[i].x;cury=video[i].y;
		
		//For consistency with other programs add fake 0 as third decimal
		writef("%d.%02d0 ",video[i].sec,video[i].hun);

		if(video[i].mouse==1)
			writef("mv ");
		else if(video[i].mouse==3)
			writef("lc ");
		else if(video[i].mouse==5)
			writef("lr ");
		else if(video[i].mouse==9)
			writef("rc ");
		else if(video[i].mouse==17)
			writef("rr ");
		else if(video[i].mouse==33)
			writef("mc ");
		else if(video[i].mouse==65)
			writef("mr ");
		else if(video[i].mouse==145)
			writef("rr ");
		else if(video[i].mouse==193)
			writef("mr ");
		else if(video[i].mouse==11)
			writef("sc ");
		else if(video[i].mouse==21)
			writef("lr ");
		writef("%d %d (%d %d)\n",video[i].x/16+1,video[i].y/16+1,video[i].x,video[i].y);
	}
}

//==============================================================================================
//Function is used to start processing data, imp by C, call by JavaScript
//==============================================================================================
EM_PORT_API(void) parser_avf(const int len, const unsigned char *byte_array)
{
	position = 0;
	length = len;
	AVF = byte_array;

	//Error if video parsing fails
	if (!readavf())
	{
		onerror(3, "Invalid AVF");
		freememory();
		return;
	}

	//Callback results and free memory
	writetxt();
	freememory();
	onsuccess();
}