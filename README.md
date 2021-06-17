# Web Minesweeper Player

## Preview

- Online preview address: https://hgraceb.github.io/web-minesweeper-player/

## Usage

1. Copy the "dist" directory to your project.

2. Modify your website entry html file as follows:

   ```html
   <!-- Chinese is displayed by default (some unhandled errors will display the original error data). -->
   <!-- If you need to display English you can set the lang attribute to start with 'en' (it only takes effect once). -->
   <html lang="en">
   
   ...
   
   <!-- First: add a container for playing the video -->
   <div id="video-stage" style="display: none;position: absolute;z-index: 999;background-color: rgba(0 ,0 ,0 ,0.33)">
       <iframe id="video-iframe" src="./dist/index.html?v=20210617" style="border: 0;width: 0;height: 0;" scrolling="no"></iframe>
   </div>
   
   ...
   
   <script>
       function playVideo(filePath) {
           /* Second: call the "Module.loadVideo" function when you need to play the video */
           document.getElementById('video-iframe').contentWindow.Module.loadVideo(filePath);
       }
   </script>
   
   ...
   ```

## About

- Example video sources：Personal、[minesweepergame.com](https://minesweepergame.com/) (World Rankings)、[saolei.wang](http://www.saolei.wang/) (China Rankings)

- Minesweeper RAW Video Format：https://github.com/thefinerminer/minesweeper-rawvf