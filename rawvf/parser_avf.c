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


unsigned char* AVF;
unsigned char* RAWVF;

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
int length;					//File byte data length
int position;				//Current processed byte index



//==============================================================================================
//Function is used to free memory
//==============================================================================================
void free_memory()
{
	if (NULL != board)
	{
		free(board);
		board = NULL;
	}
	if (NULL != AVF)
	{
		free(AVF);
		AVF = NULL;
	}
	if (NULL != RAWVF)
	{
		free(RAWVF);
		RAWVF = NULL;
	}
}


//==============================================================================================
//Function is used to callback success message, imp by C, call by JavaScript
//==============================================================================================
EM_PORT_API(void) on_success(const char *result);


//==============================================================================================
//Function is used to callback error message, imp by C, call by JavaScript
//==============================================================================================
EM_PORT_API(void) on_error(const int error_code, const char *error_msg);


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
		free_memory();
		on_error(4, "Unexpected end of file");
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
	RAWVF = (char *)malloc(0);

	//Code version and Program
	sprintf(RAWVF,"%sRawVF_Version: Rev6\n",RAWVF);
	sprintf(RAWVF,"%sProgram: %s\n",RAWVF,program);

	//Print Version details
	//Prints first two parts of version (ie., '0.52')
	sprintf(RAWVF,"%sVersion: 0.%d",RAWVF,ver);

	//Prints third part of version if it exists (ie, '.3' or ' DEBUG')
	if(versionprint[0]!=' ' && spacer=='.')
	{
		sprintf(RAWVF,"%s.%s\n",RAWVF,versionprint);
	}
	else if(versionprint[0]!=' '&& spacer==' ')
	{
		sprintf(RAWVF,"%s %s\n",RAWVF,versionprint);
	}
	else sprintf(RAWVF,"%s\n",RAWVF);

	//Print Player
	sprintf(RAWVF,"%sPlayer: %s\n",RAWVF,name);

	//Print grid details
	sprintf(RAWVF,"%sLevel: %s\n",RAWVF,level_names[mode]);
	sprintf(RAWVF,"%sWidth: %d\n",RAWVF,w);
	sprintf(RAWVF,"%sHeight: %d\n",RAWVF,h);
	sprintf(RAWVF,"%sMines: %d\n",RAWVF,m);

	//Print Marks
	if(!qm)sprintf(RAWVF,"%sMarks: Off\n",RAWVF);
	else {sprintf(RAWVF,"%sMarks: On\n",RAWVF);}

	//Print Time
	//If score_hun starts with a 0 the 0 is dropped to prevent a calculation bug
	realtime=((score_sec*100)+(score_hun));
	realtime=realtime/100;
	sprintf(RAWVF,"%sTime: %.03f\n",RAWVF,realtime);

	//Print 3bv
	sprintf(RAWVF,"%sBBBV: %d\n",RAWVF,bbbv);

	//Calculate 3bvs
	bbbvs=(bbbv*100000)/((score_sec*100)+(score_hun));
	bbbvs=bbbvs/1000;
	sprintf(RAWVF,"%sBBBVS: %.03f\n",RAWVF,bbbvs);

	//Print Timestamp
	sprintf(RAWVF,"%sTimestamp: %s\n",RAWVF,timestamp_a);

	//Print Mode
	sprintf(RAWVF,"%sMode: %s\n",RAWVF,mode_names[mode]);

	//Print Skin
	if(skin) sprintf(RAWVF,"%sSkin: %s\n",RAWVF,skin);
	else {sprintf(RAWVF,"%sSkin: '%s\n",RAWVF," ");}

	//Print Board
	sprintf(RAWVF,"%sBoard:\n",RAWVF);
	for(i=0;i<h;++i)
	{
		for(j=0;j<w;++j)
			if(board[i*w+j])
				sprintf(RAWVF,"%s*",RAWVF);
			else
				sprintf(RAWVF,"%s0",RAWVF);
		sprintf(RAWVF,"%s\n",RAWVF);
	}

	//Print Mouse events
	sprintf(RAWVF,"%sEvents:\n",RAWVF);
	curx=cury=-1;

	for(i=0;i<size;++i)
	{
		if(video[i].mouse==1 && video[i].x==curx && video[i].y==cury) continue;
		curx=video[i].x;cury=video[i].y;
		
		//For consistency with other programs add fake 0 as third decimal
		sprintf(RAWVF,"%s%d.%02d0 ",RAWVF,video[i].sec,video[i].hun);

		if(video[i].mouse==1)
			sprintf(RAWVF,"%smv ",RAWVF);
		else if(video[i].mouse==3)
			sprintf(RAWVF,"%slc ",RAWVF);
		else if(video[i].mouse==5)
			sprintf(RAWVF,"%slr ",RAWVF);
		else if(video[i].mouse==9)
			sprintf(RAWVF,"%src ",RAWVF);
		else if(video[i].mouse==17)
			sprintf(RAWVF,"%srr ",RAWVF);
		else if(video[i].mouse==33)
			sprintf(RAWVF,"%smc ",RAWVF);
		else if(video[i].mouse==65)
			sprintf(RAWVF,"%smr ",RAWVF);
		else if(video[i].mouse==145)
			sprintf(RAWVF,"%srr ",RAWVF);
		else if(video[i].mouse==193)
			sprintf(RAWVF,"%smr ",RAWVF);
		else if(video[i].mouse==11)
			sprintf(RAWVF,"%ssc ",RAWVF);
		else if(video[i].mouse==21)
			sprintf(RAWVF,"%slr ",RAWVF);
		sprintf(RAWVF,"%s%d %d (%d %d)\n",RAWVF,video[i].x/16+1,video[i].y/16+1,video[i].x,video[i].y);
	}
}

//==============================================================================================
//Function is used to handling file byte data, imp by C, call by JavaScript:
//==============================================================================================
EM_PORT_API(void) on_message(const int len, const unsigned char* byte_array){
	position = 0;
	length = len;
	AVF = byte_array;

	//Error if video parsing fails
	if(!readavf())
	{
	    on_error(3, "Invalid AVF");
	    free_memory();
		return;
	}

	//Callback results and free memory
	writetxt();
	on_success(RAWVF);
	free_memory();
}