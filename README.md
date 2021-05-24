# Web Minesweeper Player
## Preview

- Online preview address: https://hgraceb.github.io/web-minesweeper-player/

## Usage

1. Copy the "src" directory to your project.

2. Modify your website entry html file as follows:

   ```html
   ...
   
   <!-- First: add a container for playing the video -->
   <div id="video-stage" style="position: absolute;z-index: 999;background-color: rgba(0 ,0 ,0 ,0.33)">
       <iframe id="video-iframe" src="./src/video.html?v=20210524" style="border: 0;width: 0;height: 0;" scrolling="no"></iframe>
   </div>
   
   ...
   
   <script>
       function playVideo(filePath) {
           /* Second: call the "loadVideo" function when you need to play the video */
           document.getElementById('video-iframe').contentWindow.loadVideo(filePath);
       }
   </script>
   
   ...
   ```

   