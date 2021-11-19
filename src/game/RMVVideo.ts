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

 Modified by Enbin Hu (Flop) 2021-11-19. Rewrote with TypeScript.

 Works on all known RMV versions but not earlier UMF files.
 *****************************************************************/

import { BaseVideo, VideoEvent } from '@/game/BaseVideo'

export class RMVVideo extends BaseVideo {
  protected mWidth = -1
  protected mHeight = -1
  protected mMines = -1
  protected mMarks = 0
  protected mBoard: number[] = []
  protected mEvents: VideoEvent[] = []
  protected mPlayer: Uint8Array = new Uint8Array()

  constructor (data: ArrayBuffer) {
    super(data)
    // 解析 RMV 录像
    if (!this.readrmv()) {
      this.error('Invalid RMV')
    }
  }

  /**
   * Function is used to read video data
   */
  private readrmv () {
    // Initialise local variables
    // int i,j,cur=0;
    let c, d
    const header1 = '*rmv'
    // int fs;
    // int result_string_size; // Value gives string length starting at LEVEL in header
    // int version_info_size; // Value gives string length starting at Viennasweeper in header
    // int player_info_size; // Value gives string length starting at Name in header
    // int board_size;
    // int preflags_size;
    // int properties_size;
    // int vid_size;
    // int cs_size;
    // int num_player_info;
    // int name_length;
    // int nick_length;
    // int country_length;
    // int token_length;
    // int num_preflags;
    // int is_first_event=1;

    // Check first 4 bytes of header is *rmv
    for (let i = 0; i < 4; ++i) if ((c = this.getChar()) !== header1[i]) this.error('No RMV header')

    // The getint2 function reads 2 bytes at a time
    // In legitimate videos byte 4=0 and byte 5=1, getint2 sum is thus 1
    if (this.getInt2() !== 1) this.error('Invalid video type')

    // The getint functions reads 4 bytes at a time
    const fs = this.getInt() // Gets byte 6-9
    const resultStringSize = this.getInt2() // Gets bytes 10-11
    const versionInfoSize = this.getInt2() // Gets bytes 12-13
    const playerInfoSize = this.getInt2() // Gets bytes 14-15
    const boardSize = this.getInt2() // Gets bytes 16-17
    const preflagsSize = this.getInt2() // Gets bytes 18-19
    const propertiesSize = this.getInt2() // Gets bytes 20-21
    const vidSize = this.getInt() // Gets bytes 22-25
    const csSize = this.getInt2() // Gets bytes 26-27
    this.getNum() // Gets byte 28 which is a newline

    // // Length of result_string_size starts 3 bytes before 'LEVEL' and ends on the '#' before Version
    // // Version 2.2 was first to have a full length header
    // // Earlier versions could have maximum header length of 35 bytes if Intermediate and 9999.99
    // // This means it is Version 2.2 or later so we want to parse more of the header
    // if (result_string_size>35)
    // {
    //   // Reads last part of string after '3BV'
    //   for(i=0;i<result_string_size-32;++i) _fgetc(RMV);
    //
    //   // Fetch those last 3 bytes which should contain 3bv (either :xx or xxx)
    //   // Note that lost games save 0 as the 3BV value
    //   for(i=0;i<3;++i) bbbv[i]=_fgetc(RMV);
    //   if (!isdigit(bbbv[0])) bbbv[0]=' ';
    //   if (!isdigit(bbbv[1])) bbbv[1]=' ';
    //   if (!isdigit(bbbv[2])) bbbv[2]=' ';
    //
    //   // Throw away some bytes to get to Timestamp
    //   for(i=0;i<16;++i) _fgetc(RMV);
    //
    //   // Fetch Timestamp
    //   for(i=0;i<10;++i) timestamp[i]=_fgetc(RMV);
    // }
    //
    // // Release 2 beta and earlier versions do not have 3bv or Timestamp
    // else
    // {
    //   bbbv[0]='0';
    //   timestamp[0]='0';
    //   for(i=0;i<result_string_size-3;++i) _fgetc(RMV);
    // }
    //
    // // Throw away the 2 bytes '# ' before 'Vienna...'
    // _fgetc(RMV);
    // _fgetc(RMV);
    //
    // // Program is 18 bytes 'Vienna Minesweeper'
    // for(i=0;i<18;++i) program[i]=_fgetc(RMV);
    // program[i]=0;
    //
    // // Throw away the ' - '
    // _fgetc(RMV);
    // _fgetc(RMV);
    // _fgetc(RMV);
    //
    // // Put remainder of version string into a new string
    // for(i=0;i<version_info_size-22;++i) version[i]=_fgetc(RMV);
    // version[i]=0;
    //
    // // Home Edition 3.0H and Scoreganizer 3.0C and later have 1 extra byte (a period) before player name
    // _fgetc(RMV);
    //
    // // Check next two bytes to see if player entered Name
    // num_player_info=this.getInt2();
    //
    // // Fetch Player fields (name, nick, country, token) if they exist
    // // These last 3 fields were defined in Viennasweeper 3.1 RC1
    // if(num_player_info>0)
    // {
    //   name_length=_fgetc(RMV);
    //   for(i=0;i<name_length;++i) name[i]=_fgetc(RMV);
    //   name[i]=0;
    // }
    // if(num_player_info>1)
    // {
    //   nick_length=_fgetc(RMV);
    //   for(i=0;i<nick_length;++i) nick[i]=_fgetc(RMV);
    //   nick[i]=0;
    // }
    // if(num_player_info>2)
    // {
    //   country_length=_fgetc(RMV);
    //   for(i=0;i<country_length;++i) country[i]=_fgetc(RMV);
    //   country[i]=0;
    // }
    // if(num_player_info>3)
    // {
    //   token_length=_fgetc(RMV);
    //   for(i=0;i<token_length;++i) token[i]=_fgetc(RMV);
    //   token[i]=0;
    // }
    //
    // // Throw away next 4 bytes
    // this.getInt();
    //
    // // Get board size and Mine details
    // w=_fgetc(RMV); // Next byte is w so 8, 9 or 1E
    // h=_fgetc(RMV); // Next byte is h so 8, 9 or 10
    // m=this.getInt2(); // Next two bytes are number of mines
    //
    // // Fetch board layout and put in memory
    // board=(int*)malloc(sizeof(int)*w*h);
    // for(i=0;i<w*h;++i) board[i]=0;
    //
    // // Every 2 bytes is x,y with 0,0 being the top left corner
    // for(i=0;i<m;++i)
    // {
    //   c=_fgetc(RMV);d=_fgetc(RMV);
    //   if(c>w || d>h) error("Invalid mine position");
    //   board[d*w+c]=1;
    // }
    //
    // // Check number of flags placed before game started
    // if(preflags_size)
    // {
    //   num_preflags=this.getInt2();
    //   for(i=0;i<num_preflags;++i)
    //   {
    //     c=_fgetc(RMV);d=_fgetc(RMV);
    //
    //     video[cur].event=4;
    //     video[cur].x=square_size/2+c*square_size;
    //     video[cur].y=square_size/2+d*square_size;
    //     video[cur].time=0;
    //     cur++;
    //
    //     video[cur].event=5;
    //     video[cur].x=square_size/2+c*square_size;
    //     video[cur].y=square_size/2+d*square_size;
    //     video[cur].time=0;
    //     cur++;
    //   }
    // }
    //
    // // Fetch game properties
    // qm=_fgetc(RMV); // Value 1 if Questionmarks used, otherwise 0
    // nf=_fgetc(RMV); // Value 1 if no Flags were used, otherwise 0
    // mode=_fgetc(RMV); // Value 0 for Classic, 1 UPK, 2 Cheat, 3 Density
    // level=_fgetc(RMV); // Value 0 for Beg, 1 Int, 2 Exp, 3 Custom
    //
    // // Throw away rest of properties
    // for(i=4;i<properties_size;++i) _fgetc(RMV);
    //
    // // Each iteration reads one event
    // while(1)
    // {
    //   video[cur].event=c=_fgetc(RMV);++i;
    //
    //   // Get next 4 bytes containing time of event
    //   if(!c)
    //   {
    //     this.getInt();i+=4;
    //   }
    //   // Get mouse event (3 bytes time, 1 wasted, 2 width, 2 height)
    //   else if(c<=7)
    //   {
    //     i+=8;
    //     video[cur].time=getint3(RMV);
    //     _fgetc(RMV);
    //     video[cur].x=this.getInt2()-12;
    //     video[cur].y=this.getInt2()-56;
    //     cur++;
    //
    //     // Viennasweeper does not record clicks before timer starts
    //     // LR starts timer so the first LC is missed in the video file
    //     // This code generates the missing LC in that case
    //     // In other cases it generates a ghost event thus event[0] is empty
    //     if(is_first_event)
    //     {
    //       // Global variable set to 1 so on first iteration it becomes 0
    //       is_first_event=0;
    //       // Clone first recorded event but set missing event to LC
    //       video[cur].event=video[cur-1].event;
    //       video[cur-1].event=2;
    //       video[cur].time=video[cur-1].time;
    //       video[cur].x=video[cur-1].x;
    //       video[cur].y=video[cur-1].y;
    //       cur++;
    //     }
    //   }
    //   else if(c==8) error("Invalid event");
    //   // Get board event (ie, 'pressed' or 'number 3')
    //   else if(c<=14 || (c>=18 && c<=27))
    //   {
    //     i+=2;
    //     video[cur].x=_fgetc(RMV)+1;
    //     video[cur].y=_fgetc(RMV)+1;
    //     cur++;
    //   }
    //   // Get game status (ie, 'won')
    //   else if(c<=17)
    //   {
    //     break;
    //   }
    //   else
    //   {
    //     error("Invalid event");
    //   }
    // }
    //
    // // Number of game events
    // size=cur+1;

    return 1
  }
}
