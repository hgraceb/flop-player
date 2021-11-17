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

 Modified by Enbin Hu (Flop) 2021-11-17. Rewrote with TypeScript.

 Note Clone 2007 (not this program) has a bug where the day sometimes does not
 save correctly resulting in a value of 00. Also, Clone 0.97 beta sometimes
 saves the time 0.01s different than the actual end time per last mouse event.
 *****************************************************************/

import { Video, VideoEvent } from '@/game/video'

// 录像事件
class Event {
  sec = 0
  ths = 0
  x = 0
  y = 0
  lb = 0
  rb = 0
  mb = 0
  // Versions before 0.97 have an extra byte in each event
  weirdnessBit = 0
}

export class MVFVideo extends Video {
  protected mWidth = -1
  protected mHeight = -1
  protected mMines = -1
  protected mMarks = 0
  protected mBoard: number[] = []
  protected mEvents: VideoEvent[] = []
  protected mPlayer: Uint8Array = new Uint8Array()

  private readonly MAX_NAME = 1000
  // Mode
  private mode = 0
  // Level
  private level = 0
  // Width
  private w = 0
  // Height
  private h = 0
  // Mines
  private m = 0
  // Number of game events
  private size = 0
  // Array to store board cells
  private board: number[] = []
  // Questionmarks
  private qm = 0
  // TRUE if Clone 0.97, 2006, 2007
  private hasDate = 0
  // Timestamp
  private timestamp: string[] = []
  // Date variables taken from Timestamp
  private month = 0
  private year = 0
  private day = 0
  private hour = 0
  private minute = 0
  private second = 0
  // TRUE if Clone 0.97
  private hasInfo = 0
  // Stats only available in Clone 0.97 videos
  private bbbv = 0
  private lcl = 0
  private rcl = 0
  private dcl = 0
  private solvedBBBV = 0
  // Time in seconds and decimals
  private scoreSec = 0
  private scoreThs = 0
  // Player name
  private name: number[] = []
  // Program defined here instead of reading from video
  private readonly program = 'Minesweeper Clone'
  // Version
  private version = ''
  // Game events
  private video: Event[] = []
  // Cell size used in mouse movement calculations
  private readonly squareSize = 16
  // 3bvs
  private bbbvs = 0.0

  constructor (data: ArrayBuffer) {
    super(data)
    // 解析 MVF 录像
    if (!this.readmvf()) {
      this.throwError('Invalid MVF')
    }
  }

  private getInt2 () {
    const c = []
    c[0] = this.getNum()
    c[1] = this.getNum()
    // This code reads 2 bytes and puts them in a 4 byte int
    // You cannot "add" bytes in the normal sense, instead you perform shift operations
    // Multiplying by 256 is the same as shifting left by 1 byte (8 bits)
    // The result is c[0] is moved to int byte 3 while c[1] stayes in int byte 4
    return c[1] + c[0] * 256
  }

  private getInt3 () {
    const c = []
    c[0] = this.getNum()
    c[1] = this.getNum()
    c[2] = this.getNum()
    return c[2] + c[1] * 256 + c[0] * 65536
  }

  /**
   * Function to read board layout into memory
   */
  private readBoard (add: number) {
    let c
    let i, pos
    this.w = this.getNum()
    this.h = this.getNum()

    const boardSize = this.w * this.h
    for (i = 0; i < boardSize; ++i) this.board[i] = 0

    // Get number of Mines
    c = this.getNum()
    this.m = c << 8
    c = this.getNum()
    this.m += c

    for (i = 0; i < this.m; ++i) {
      c = this.getNum()
      pos = c + add
      c = this.getNum()
      pos += (c + add) * this.w
      if (pos >= boardSize || pos < 0) this.throwError('Invalid mine position')
      this.board[pos] = 1
    }
  }

  /**
   * Function to read Clone 0.97 videos
   */
  private read097 () {
    // // Initialise local variables
    // unsigned char c;
    // int len,i,j,cur;
    // double leading;
    // double num1,num2,num3;
    // char s[41];
    // int byte[40];
    // unsigned char bit[40];
    // const int mult=100000000;
    // unsigned char e[5];
    //
    // // Clone 0.97 has Date (Timestamp)
    // has_date=has_info=1;
    //
    // // Read Date (Timestamp)
    // month=(c=_fgetc(MVF));
    // day=(c=_fgetc(MVF));
    // year=getint2(MVF);
    // hour=_fgetc(MVF);
    // minute=_fgetc(MVF);
    // second=_fgetc(MVF);
    //
    // // Next 2 bytes are Level and Mode
    // level=_fgetc(MVF);
    // mode=_fgetc(MVF);
    //
    // // Next 3 bytes are Time
    // read_score();
    //
    // // Next 11 bytes provide stats only available to Clone 0.97
    // bbbv=getint2(MVF); // 3bv
    // solved_bbbv=getint2(MVF); // Solved 3bv
    // lcl=getint2(MVF); // Left clicks
    // dcl=getint2(MVF); // Double clicks
    // rcl=getint2(MVF); // Right clicks
    //
    // // Check if Questionmark option was turned on
    // qm=_fgetc(MVF);
    //
    // // Function gets Width, Height and Mines then reads board layout into memory
    // readBoard(-1);
    //
    // // Byte before Player gives length of name
    // len=_fgetc(MVF);
    // for(i=0;i<len;++i) name[i]=_fgetc(MVF);
    // name[len]=0;
    //
    // // First 2 bytes determine the file permutation
    // leading=getint2(MVF);
    // num1=sqrt(leading);
    // num2=sqrt(leading+1000.0);
    // num3=sqrt(num1+1000.0);
    // sprintf(s,"%08d",(int)(lrint(fabs(cos(num3+1000.0)*mult))));
    // sprintf(s+8,"%08d",(int)(lrint(fabs(sin(sqrt(num2))*mult))));
    // sprintf(s+16,"%08d",(int)(lrint(fabs(cos(num3)*mult))));
    // sprintf(s+24,"%08d",(int)(lrint(fabs(sin(sqrt(num1)+1000.0)*mult))));
    // sprintf(s+32,"%08d",(int)(lrint(fabs(cos(sqrt(num2+1000.0))*mult))));
    // s[40]=0;
    // cur=0;
    // for(i='0';i<='9';++i)
    //   for(j=0;j<40;++j)
    //     if(s[j]==i)
    //     {
    //       byte[cur]=j/8;
    //       bit[cur++]=1<<(j%8);
    //     }
    //
    // // Get number of bytes that store mouse events
    // size=getint3(MVF);
    // if(size>=MAXREP) error("Too large video");
    //
    // // Read mouse events
    // for(i=0;i<size;++i)
    // {
    //   read_event(5,e);
    //
    //   video[i].rb=apply_perm(0,byte,bit,e);
    //   video[i].mb=apply_perm(1,byte,bit,e);
    //   video[i].lb=apply_perm(2,byte,bit,e);
    //   video[i].x=video[i].y=video[i].ths=video[i].sec=0;
    //   for(j=0;j<9;++j)
    //   {
    //     video[i].x|=(apply_perm(12+j,byte,bit,e)<<j);
    //     video[i].y|=(apply_perm(3+j,byte,bit,e)<<j);
    //   }
    //   for(j=0;j<7;++j) video[i].ths|=(apply_perm(21+j,byte,bit,e)<<j);
    //   video[i].ths*=10;
    //   for(j=0;j<10;++j) video[i].sec|=(apply_perm(28+j,byte,bit,e)<<j);
    // }
    return 1
  }

  /**
   * Function to read Clone 2006 and 2007 videos
   */
  private read2007 () {
    // Initialise local variables
    let c
    let len, i // , j, cur
    // let num1, num2, num3, num4
    // char s[49];
    // int byte[48];
    // unsigned char bit[48];
    // const int mult=100000000;
    // unsigned char e[6];
    //
    // // Clone 2006 and 2007 have Date (Timestamp)
    // has_date=1;has_info=0;

    // Read Date (Timestamp)
    this.month = (c = this.getNum())
    this.day = (c = this.getNum())
    this.year = this.getInt2()
    this.hour = this.getNum()
    this.minute = this.getNum()
    this.second = this.getNum()

    // Next 2 bytes are Level and Mode
    this.level = this.getNum()
    this.mode = this.getNum()

    // Next 3 bytes are Time
    this.scoreThs = this.getInt3()
    this.scoreSec = Math.floor(this.scoreThs / 1000)
    this.scoreThs %= 1000

    // Check if Questionmark option was turned on
    this.qm = this.getNum()

    // Function gets Width, Height and Mines then reads board layout into memory
    this.readBoard(-1)

    // Byte before Player gives length of name
    len = this.getNum()
    if (len >= this.MAX_NAME) len = this.MAX_NAME - 1
    for (i = 0; i < len; ++i) this.name[i] = this.getNum()

    // First 2 bytes determine the file permutation
    const leading = this.getInt2()
    const num1 = Math.sqrt(leading)
    const num2 = Math.sqrt(leading + 1000.0)
    const num3 = Math.sqrt(num1 + 1000.0)
    const num4 = Math.sqrt(num2 + 1000.0)
    // sprintf(s,"%08d",(int)(lrint(fabs(cos(num3+1000.0)*mult))));
    // sprintf(s+8,"%08d",(int)(lrint(fabs(sin(sqrt(num2))*mult))));
    // sprintf(s+16,"%08d",(int)(lrint(fabs(cos(num3)*mult))));
    // sprintf(s+24,"%08d",(int)(lrint(fabs(sin(sqrt(num1)+1000.0)*mult))));
    // sprintf(s+32,"%08d",(int)(lrint(fabs(cos(num4)*mult))));
    // sprintf(s+40,"%08d",(int)(lrint(fabs(sin(num4)*mult))));
    // s[48]=0;
    // cur=0;
    // for(i='0';i<='9';++i)
    //   for(j=0;j<48;++j)
    //     if(s[j]==i)
    //     {
    //       byte[cur]=j/8;
    //       bit[cur++]=1<<(j%8);
    //     }
    //
    // // Get number of bytes that store mouse events
    // size=getint3(MVF);
    // if(size>=MAXREP) error("Too large video");
    //
    // // Read mouse events
    // for(i=0;i<size;++i)
    // {
    //   read_event(6,e);
    //
    //   video[i].rb=apply_perm(0,byte,bit,e);
    //   video[i].mb=apply_perm(1,byte,bit,e);
    //   video[i].lb=apply_perm(2,byte,bit,e);
    //   video[i].x=video[i].y=video[i].ths=video[i].sec=0;
    //   for(j=0;j<11;++j)
    //   {
    //     video[i].x|=(apply_perm(14+j,byte,bit,e)<<j);
    //     video[i].y|=(apply_perm(3+j,byte,bit,e)<<j);
    //   }
    //   for(j=0;j<22;++j) video[i].ths|=(apply_perm(25+j,byte,bit,e)<<j);
    //   video[i].sec=video[i].ths/1000;
    //   video[i].ths%=1000;
    //   video[i].x-=32;
    //   video[i].y-=32;
    // }
    return 1
  }

  /**
   * Function to check version and parse if not standard Clone 0.97, 2006 or 2007
   */
  private readmvf () {
    // Initialise local variables
    let c: number | string = this.getNum()
    let d = this.getNum()

    // Perform version checks
    // Prior to Clone 0.97 first 2 bytes were Width and Height (so 08,10,1E)
    // Early versions also did not allow Custom videos to be saved in Legal Mode
    if (c === 0x11 && d === 0x4D) {
      // The byte after offset 27 in "new" versions is last digit of year
      this.seek(27, 'SEEK_SET')
      c = this.getChar()

      // Clone 0.97
      if (c === '5') {
        // Relevant data starts from offset 74
        this.seek(74, 'SEEK_SET')
        this.version = '0.97 beta'
        return this.read097()
        // Clone 2006 or 2007
      } else if (c === '6' || c === '7') {
        this.seek(53, 'SEEK_SET')
        c = this.getNum()
        for (d = 0; d < c; ++d) this.version += this.getChar()
        // Relevant data starts from offset 71
        this.seek(71, 'SEEK_SET')
        return this.read2007()
        // Clone 0.97 Funny Mode hack by Abiu in June 2008
      } else if (c === '8') {
        // Relevant data starts from offset 74
        this.seek(74, 'SEEK_SET')
        this.version = '0.97 Funny Mode Hack'
        c = this.read097()
        // All Funny Mode videos are UPK
        this.mode = 3
        return c
      }
    }
    return 0
  }
}
