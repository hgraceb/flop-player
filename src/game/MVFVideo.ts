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

export class MVFVideo {

}
