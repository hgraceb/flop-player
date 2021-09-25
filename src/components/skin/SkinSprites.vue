<template>
  <g style="display:none;">
    <symbol id="border-bottom-left">
      <path d="M0 0v110h10v-10h10V90h10V0H0z" fill="white" />
      <path d="M30 0v90H20v10H10v10H0v10h10v-10h10v-10h10V90h90V30h-20V20h10V10h10V0h-10v10h-10v10H90V0H30z" fill="silver" />
      <path d="M90 0v20h10V10h10V0H90z" fill="gray" />
      <path d="M110 10v10h-10v10h20V10h-10z" fill="white" />
      <path d="M30 90v10H20v10H10v10h110V90H30z" fill="gray" />
    </symbol>
    <symbol id="border-bottom-right">
      <path d="M0 0v30h30V0H0z" fill="white" />
      <path d="M30 0v30H0v60h90V0H30z" fill="silver" />
      <path d="M90 0v90H0v30h120V0H90z" fill="gray" />
    </symbol>
    <symbol id="border-horizontal-bottom">
      <path :d="`M0 0L0 30L${boardWidth} 30L${boardWidth} 0L0 0z`" fill="white" />
      <path :d="`M0 30L0 90L${boardWidth} 90L${boardWidth} 30L0 30z`" fill="silver" />
      <path :d="`M0 90L0 120L${boardWidth} 120L${boardWidth} 90L0 90z`" fill="gray" />
    </symbol>
    <symbol id="border-horizontal-middle">
      <path :d="`M0 0L0 20L${boardWidth} 20L${boardWidth} 0L0 0z`" fill="white" />
      <path :d="`M0 20L0 80L${boardWidth} 80L${boardWidth} 20L0 20z`" fill="silver" />
      <path :d="`M0 80L0 110L${boardWidth} 110L${boardWidth} 80L0 80z`" fill="gray" />
    </symbol>
    <symbol id="border-horizontal-top">
      <path :d="`M0 0L0 30L${boardWidth} 30L${boardWidth} 0L0 0z`" fill="white" />
      <path :d="`M0 30L0 90L${boardWidth} 90L${boardWidth} 30L0 30z`" fill="silver" />
      <path :d="`M0 90L0 110L${boardWidth} 110L${boardWidth} 90L0 90z`" fill="gray" />
    </symbol>
    <symbol id="border-middle-left">
      <path d="M0 0v110h30V0H0z" fill="white" />
      <path d="M30 0v110h60V80h30V20h-20V10h10V0h-10v10H90V0H30z" fill="silver" />
      <path d="M90 0v10h10V0H90z" fill="gray" />
      <path d="M110 0v10h-10v10h20V0h-10z" fill="white" />
      <path d="M90 80v30h30V80H90z" fill="gray" />
    </symbol>
    <symbol id="border-middle-right">
      <path d="M0 0v20h30V0H0z" fill="white" />
      <path d="M30 0v20H0v60h20v10H10v10H0v10h10v-10h10V90h10v20h60V0H30z" fill="silver" />
      <path d="M90 0v110h30V0H90M0 80v20h10V90h10V80H0z" fill="gray" />
      <path d="M20 90v10H10v10h20V90H20z" fill="white" />
    </symbol>
    <symbol id="border-top-left">
      <path d="M0 0v110h30V30h90V0H0z" fill="white" />
      <path d="M30 30v80h60V90h30V30H30z" fill="silver" />
      <path d="M90 90v20h30V90H90z" fill="gray" />
    </symbol>
    <symbol id="border-top-right">
      <path d="M0 0v30h90V20h10V10h10V0H0z" fill="white" />
      <path d="M110 0v10h-10v10H90v10H0v60h20v10H10v10h10v-10h10v10h60V30h10V20h10V10h10V0h-10z" fill="silver" />
      <path d="M110 10v10h-10v10H90v80h30V10h-10M0 90v20h10v-10h10V90H0z" fill="gray" />
      <path d="M20 100v10h10v-10H20z" fill="white" />
    </symbol>
    <symbol id="border-vertical-left-upper">
      <path :d="`M0 0L0 ${countTopHeight}L30 ${countTopHeight}L30 0L0 0z`" fill="white" />
      <path :d="`M30 0L30 ${countTopHeight}L90 ${countTopHeight}L90 0L30 0z`" fill="silver" />
      <path :d="`M90 0L90 ${countTopHeight}L110 ${countTopHeight}L110 0L90 0z`" fill="gray" />
      <path :d="`M110 0L110 ${countTopHeight}L120 ${countTopHeight}L120 0L110 0z`" fill="silver" />
    </symbol>
    <symbol id="border-vertical-right-upper">
      <path :d="`M0 0L0 ${countTopHeight}L10 ${countTopHeight}L10 0L0 0z`" fill="silver" />
      <path :d="`M10 0L10 ${countTopHeight}L30 ${countTopHeight}L30 0L10 0z`" fill="white" />
      <path :d="`M30 0L30 ${countTopHeight}L90 ${countTopHeight}L90 0L30 0z`" fill="silver" />
      <path :d="`M90 0L90 ${countTopHeight}L120 ${countTopHeight}L120 0L90 0z`" fill="gray" />
    </symbol>
    <symbol id="border-vertical-left-lower">
      <path :d="`M0 0L0 ${boardHeight}L30 ${boardHeight}L30 0L0 0z`" fill="white" />
      <path :d="`M30 0L30 ${boardHeight}L90 ${boardHeight}L90 0L30 0z`" fill="silver" />
      <path :d="`M90 0L90 ${boardHeight}L120 ${boardHeight}L120 0L90 0z`" fill="gray" />
    </symbol>
    <symbol id="border-vertical-right-lower">
      <path :d="`M0 0L0 ${boardHeight}L30 ${boardHeight}L30 0L0 0z`" fill="white" />
      <path :d="`M30 0L30 ${boardHeight}L90 ${boardHeight}L90 0L30 0z`" fill="silver" />
      <path :d="`M90 0L90 ${boardHeight}L120 ${boardHeight}L120 0L90 0z`" fill="gray" />
    </symbol>

    <symbol id="game-bottom-upper-left">
      <path d="M0 0v90h30V0H0z" fill="white" />
      <path d="M30 0v90h90V30h-20V20h10V10h10V0h-10v10h-10v10H90V0H30z" fill="silver" />
      <path d="M90 0v20h10V10h10V0H90z" fill="gray" />
      <path d="M110 10v10h-10v10h20V10h-10z" fill="white" />
    </symbol>
    <symbol id="game-bottom-upper-center">
      <path :d="`M0 0L0 30L${boardWidth} 30L${boardWidth} 0L0 0z`" fill="white" />
      <path :d="`M0 30L0 90L${boardWidth} 90L${boardWidth} 30L0 30z`" fill="silver" />
    </symbol>
    <symbol id="game-bottom-upper-right">
      <path d="M0 0v30h30V0H0z" fill="white" />
      <path d="M30 0v30H0v60h90V0H30z" fill="silver" />
      <path d="M90 0v90h30V0H90z" fill="gray" />
    </symbol>
    <symbol id="game-bottom-middle-left">
      <path :d="`M0 0L0 ${gameBottomMiddleHeight}L30 ${gameBottomMiddleHeight}L30 0L0 0z`" fill="white" />
      <path :d="`M30 0L30 ${gameBottomMiddleHeight}L90 ${gameBottomMiddleHeight}L90 0L30 0z`" fill="silver" />
      <path :d="`M90 0L90 ${gameBottomMiddleHeight}L120 ${gameBottomMiddleHeight}L120 0L90 0z`" fill="#e0e0e0" />
    </symbol>
    <symbol id="game-bottom-middle-center">
      <path :d="`M0 0L0 ${gameBottomMiddleHeight}L${boardWidth} ${gameBottomMiddleHeight}L${boardWidth} 0L0 0z`" fill="#e0e0e0" />
    </symbol>
    <symbol id="game-bottom-middle-right">
      <path :d="`M0 0L0 ${gameBottomMiddleHeight}L30 ${gameBottomMiddleHeight}L30 0L0 0z`" fill="#e0e0e0" />
      <path :d="`M30 0L30 ${gameBottomMiddleHeight}L90 ${gameBottomMiddleHeight}L90 0L30 0z`" fill="silver" />
      <path :d="`M90 0L90 ${gameBottomMiddleHeight}L120 ${gameBottomMiddleHeight}L120 0L90 0z`" fill="gray" />
    </symbol>
    <symbol id="game-bottom-lower-left">
      <path d="M0 0v80h10V70h10V60h10V0H0z" fill="white" />
      <path d="M30 0v60H20v10H10v10H0v10h10V80h10V70h10V60h90V0H30z" fill="silver" />
      <path d="M30 60v10H20v10H10v10h110V60H30z" fill="gray" />
    </symbol>
    <symbol id="game-bottom-lower-center">
      <path :d="`M0 0L0 60L${boardWidth} 60L${boardWidth} 0L0 0z`" fill="silver" />
      <path :d="`M0 60L0 90L${boardWidth} 90L${boardWidth} 60L0 60z`" fill="gray" />
    </symbol>
    <symbol id="game-bottom-lower-right">
      <path d="M0 0v60h90V0H0z" fill="silver" />
      <path d="M90 0v60H0v30h120V0H90z" fill="gray" />
    </symbol>

    <symbol id="cell-flag">
      <path d="M0 0v150h10v-10h10V20h120V10h10V0H0z" fill="white" />
      <path d="M150 0v10h-10v10H20v120H10v10H0v10h10v-10h10v-10h120V20h10V10h10V0h-10z" fill="silver" />
      <path d="M150 10v10h-10v120H20v10H10v10h150V10h-10z" fill="gray" />
      <path d="M70 30v10H50v10H40v10h10v10h20v10h20V30H70z" fill="red" />
      <path d="M80 80v20H60v10H40v20h80v-20h-20v-10H90V80H80z" />
    </symbol>
    <symbol id="cell-flag-wrong">
      <path d="M0 0v160h10V10h150V0H0z" fill="gray" />
      <path d="M10 10v150h150V10H10z" fill="silver" />
      <path d="M80 20v20H60v20h20v20h10V70h10V60h10V40H90V20H80z" />
      <path d="M20 30v10h10v10h10v10h10v10h10v10h10v20H60v10H50v10H40v10H30v10H20v10h20v-10h10v-10h10v-10h10v-10h10v-10h10v10h10v10h10v10h10v10h10v10h20v-10h-10v-10h-10v-10h-10v-10h-10v-10h-10V80h10V70h10V60h10V50h10V40h10V30h-20v10h-10v10h-10v10h-10v10H90v10H80V70H70V60H60V50H50V40H40V30H20z" fill="red" />
      <path d="M40 60v20H20v10h20v20h20v-10h10V80H60V70H50V60H40z" />
      <path d="M70 60v10h10V60H70z" fill="white" />
      <path d="M120 60v10h-10v10h-10v20h10v10h20V90h20V80h-20V60h-10m-40 40v10H70v10H60v10h20v20h10v-20h20v-10h-10v-10H90v-10H80z" />
    </symbol>
    <symbol id="cell-mine">
      <path d="M0 0v160h10V10h150V0H0z" fill="gray" />
      <path d="M10 10v150h150V10H10z" fill="silver" />
      <path d="M80 20v20H60v10H50V40H40v10h10v10H40v20H20v10h20v20h10v10H40v10h10v-10h10v10h20v20h10v-20h20v-10h10v10h10v-10h-10v-10h10V90h20V80h-20V60h-10V50h10V40h-10v10h-10V40H90V20H80z" />
      <path d="M60 60v20h20V60H60z" fill="white" />
    </symbol>
    <symbol id="cell-mine-bomb">
      <path d="M0 0v160h10V10h150V0H0z" fill="gray" />
      <path d="M10 10v150h150V10H10z" fill="red" />
      <path d="M80 20v20H60v10H50V40H40v10h10v10H40v20H20v10h20v20h10v10H40v10h10v-10h10v10h20v20h10v-20h20v-10h10v10h10v-10h-10v-10h10V90h20V80h-20V60h-10V50h10V40h-10v10h-10V40H90V20H80z" />
      <path d="M60 60v20h20V60H60z" fill="white" />
    </symbol>
    <symbol id="cell-normal">
      <path d="M0 0v150h10v-10h10V20h120V10h10V0H0z" fill="white" />
      <path d="M150 0v10h-10v10H20v120H10v10H0v10h10v-10h10v-10h120V20h10V10h10V0h-10z" fill="silver" />
      <path d="M150 10v10h-10v120H20v10H10v10h150V10h-10z" fill="gray" />
    </symbol>
    <symbol id="cell-number-0">
      <path d="M0 0v160h10V10h150V0H0z" fill="gray" />
      <path d="M10 10v150h150V10H10z" fill="silver" />
    </symbol>
    <symbol id="cell-number-1">
      <path d="M0 0v160h10V10h150V0H0z" fill="gray" />
      <path d="M10 10v150h150V10H10z" fill="silver" />
      <path d="M80 30v10H70v10H60v10H50v10h20v40H50v20h70v-20h-20V30H80z" fill="#00f" />
    </symbol>
    <symbol id="cell-number-2">
      <path d="M0 0v160h10V10h150V0H0z" fill="gray" />
      <path d="M10 10v150h150V10H10z" fill="silver" />
      <path d="M40 30v10H30v20h30V50h40v20H80v10H60v10H40v10H30v30h100v-20H70v-10h20V90h20V80h10V70h10V40h-10V30H40z" fill="green" />
    </symbol>
    <symbol id="cell-number-3">
      <path d="M0 0v160h10V10h150V0H0z" fill="gray" />
      <path d="M10 10v150h150V10H10z" fill="silver" />
      <path d="M30 30v20h70v20H60v20h40v20H30v20h90v-10h10V90h-10V70h10V40h-10V30H30z" fill="red" />
    </symbol>
    <symbol id="cell-number-4">
      <path d="M0 0v160h10V10h150V0H0z" fill="gray" />
      <path d="M10 10v150h150V10H10z" fill="silver" />
      <path d="M50 30v20H40v20H30v20h60v40h30V90h10V70h-10V30H90v40H70V50h10V30H50z" fill="navy" />
    </symbol>
    <symbol id="cell-number-5">
      <path d="M0 0v160h10V10h150V0H0z" fill="gray" />
      <path d="M10 10v150h150V10H10z" fill="silver" />
      <path d="M30 30v60h70v20H30v20h90v-10h10V80h-10V70H60V50h70V30H30z" fill="maroon" />
    </symbol>
    <symbol id="cell-number-6">
      <path d="M0 0v160h10V10h150V0H0z" fill="gray" />
      <path d="M10 10v150h150V10H10z" fill="silver" />
      <path d="M40 30v10H30v80h10v10h80v-10h10V80h-10V70H60V50h60V30H40z" fill="teal" />
      <path d="M60 90v20h40V90H60z" fill="silver" />
    </symbol>
    <symbol id="cell-number-7">
      <path d="M0 0v160h10V10h150V0H0z" fill="gray" />
      <path d="M10 10v150h150V10H10z" fill="silver" />
      <path d="M30 30v20h70v20H90v20H80v20H70v20h30v-20h10V90h10V70h10V30H30z" />
    </symbol>
    <symbol id="cell-number-8">
      <path d="M0 0v160h10V10h150V0H0z" fill="gray" />
      <path d="M10 10v150h150V10H10z" fill="silver" />
      <path d="M40 30v10H30v30h10v20H30v30h10v10h80v-10h10V90h-10V70h10V40h-10V30H40z" fill="gray" />
      <path d="M60 50v20h40V50H60m0 40v20h40V90H60z" fill="silver" />
    </symbol>
    <symbol id="cell-press">
      <path d="M0 0v160h10V10h150V0H0z" fill="gray" />
      <path d="M10 10v150h150V10H10z" fill="silver" />
    </symbol>
    <symbol id="cell-question">
      <path d="M0 0v150h10v-10h10V20h120V10h10V0H0z" fill="white" />
      <path d="M150 0v10h-10v10H20v120H10v10H0v10h10v-10h10v-10h120V20h10V10h10V0h-10z" fill="silver" />
      <path d="M150 10v10h-10v120H20v10H10v10h150V10h-10z" fill="gray" />
      <path d="M60 30v10H50v20h20V40h20v30H80v10H70v20h20V80h10V70h10V40h-10V30H60m10 80v20h20v-20H70z" />
    </symbol>
    <symbol id="cell-question-press">
      <path d="M0 0v160h10V10h150V0H0z" fill="gray" />
      <path d="M10 10v150h150V10H10z" fill="silver" />
      <path d="M70 40v10H60v20h20V50h20v30H90v10H80v20h20V90h10V80h10V50h-10V40H70m10 80v20h20v-20H80z" />
    </symbol>
    <symbol id="count-0">
      <path d="M0 0v10h10v10h10v10h10v50H20v10H10v10H0v10h10v10h10v10h10v50H20v10H10v10H0v10h10v-10h10v-10h10v-10h50v10h10v10h10v10h10v-10h-10v-10H90v-10H80v-50h10v-10h10v-10h10v-10h-10V90H90V80H80V30h10V20h10V10h10V0h-10v10H90v10H80v10H30V20H20V10H10V0H0z" />
      <path d="M10 0v10h10v10h10v10h50V20h10V10h10V0H10M0 10v90h10V90h10V80h10V30H20V20H10V10H0m100 0v10H90v10H80v50h10v10h10v10h10V10h-10z" fill="red" />
      <path d="M30 90v10H20v10h10v10h10v-10h10v10h10v-10h10v10h10v-10h10v-10H80V90H70v10H60V90H50v10H40V90H30z" fill="maroon" />
      <path d="M30 100v10h10v-10H30m20 0v10h10v-10H50m20 0v10h10v-10H70z" />
      <path d="M0 110v90h10v-10h10v-10h10v-50H20v-10H10v-10H0m100 0v10H90v10H80v50h10v10h10v10h10v-90h-10m-70 70v10H20v10H10v10h90v-10H90v-10H80v-10H30z" fill="red" />
    </symbol>
    <symbol id="count-1">
      <path d="M0 0v10h10v10H0v10h10v10H0v10h10v10H0v10h10v10H0v10h10v10H0v10h10v10H0v10h10v10H0v10h10v10H0v10h10v10H0v10h10v10H0v10h20v-10h10v10h10v-10h10v10h10v-10h10v10h10v-10h10v10h20v-10h-10v-10H90v-10H80v-50h10v-10h10v-10h10v-10h-10V90H90V80H80V30h10V20h10V10h10V0H90v10H80V0H70v10H60V0H50v10H40V0H30v10H20V0H0z" />
      <path d="M20 0v10h10V0H20m20 0v10h10V0H40m20 0v10h10V0H60m20 0v10h10V0H80M0 10v10h10V10H0m30 0v10h10v10h10V20h10v10h10V20h10V10H70v10H60V10H50v10H40V10H30z" fill="maroon" />
      <path d="M100 10v10H90v10H80v50h10v10h10v10h10V10h-10z" fill="red" />
      <path d="M10 20v10h10v10H10v10h10v10H10v10h10v10H10v10h10V80h10V70H20V60h10V50H20V40h10V30H20V20H10M0 30v10h10V30H0m0 20v10h10V50H0m0 20v10h10V70H0m0 20v10h10V90H0m30 0v10H20v10h10v10h10v-10h10v10h10v-10h10v10h10v-10h10v-10H80V90H70v10H60V90H50v10H40V90H30z" fill="maroon" />
      <path d="M30 100v10h10v-10H30m20 0v10h10v-10H50m20 0v10h10v-10H70z" />
      <path d="M0 110v10h10v-10H0z" fill="maroon" />
      <path d="M100 110v10H90v10H80v50h10v10h10v10h10v-90h-10z" fill="red" />
      <path d="M10 120v10h10v10H10v10h10v10H10v10h10v10H10v10h10v-10h10v-10H20v-10h10v-10H20v-10h10v-10H20v-10H10M0 130v10h10v-10H0m0 20v10h10v-10H0m0 20v10h10v-10H0m40 10v10H30v10h10v-10h10v10h10v-10h10v10h10v-10H70v-10H60v10H50v-10H40M0 190v10h10v-10H0m20 10v10h10v-10H20m20 0v10h10v-10H40m20 0v10h10v-10H60m20 0v10h10v-10H80z" fill="maroon" />
    </symbol>
    <symbol id="count-2">
      <path d="M0 0v10h10v10H0v10h10v10H0v10h10v10H0v10h10v10H0v10h10v10H0v10h10v10h10v10h10v50H20v10H10v10H0v10h10v-10h10v-10h10v-10h50v10h10v10h10v10h10v-10h-10v-10h10v-10h-10v-10h10v-10h-10v-10h10v-10h-10v-10h10v-10h-10v-10h10v-10h-10V90H90V80H80V30h10V20h10V10h10V0h-10v10H90v10H80v10H30V20H20V10H10V0H0z" />
      <path d="M10 0v10h10v10h10v10h50V20h10V10h10V0H10z" fill="red" />
      <path d="M0 10v10h10V10H0z" fill="maroon" />
      <path d="M100 10v10H90v10H80v50h10v10h10v10h10V10h-10z" fill="red" />
      <path d="M10 20v10h10v10H10v10h10v10H10v10h10v10H10v10h10V80h10V70H20V60h10V50H20V40h10V30H20V20H10M0 30v10h10V30H0m0 20v10h10V50H0m0 20v10h10V70H0m0 20v10h10V90H0z" fill="maroon" />
      <path d="M20 90v10H10v10h10v10h70v-10h10v-10H90V90H20M0 110v90h10v-10h10v-10h10v-50H20v-10H10v-10H0z" fill="red" />
      <path d="M100 110v10h10v-10h-10m-10 10v10h10v-10H90m-10 10v10h10v-10H80m20 0v10h10v-10h-10m-10 10v10h10v-10H90m-10 10v10h10v-10H80m20 0v10h10v-10h-10m-10 10v10h10v-10H90m-10 10v10h10v-10H80m20 0v10h10v-10h-10z" fill="maroon" />
      <path d="M30 180v10H20v10H10v10h90v-10H90v-10H80v-10H30z" fill="red" />
      <path d="M90 180v10h10v-10H90m10 10v10h10v-10h-10z" fill="maroon" />
    </symbol>
    <symbol id="count-3">
      <path d="M0 0v10h10v10H0v10h10v10H0v10h10v10H0v10h10v10H0v10h10v10H0v10h10v10H0v10h10v10H0v10h10v10H0v10h10v10H0v10h10v10H0v10h10v-10h10v-10h10v-10h50v10h10v10h10v10h10v-10h-10v-10H90v-10H80v-50h10v-10h10v-10h10v-10h-10V90H90V80H80V30h10V20h10V10h10V0h-10v10H90v10H80v10H30V20H20V10H10V0H0z" />
      <path d="M10 0v10h10v10h10v10h50V20h10V10h10V0H10z" fill="red" />
      <path d="M0 10v10h10V10H0z" fill="maroon" />
      <path d="M100 10v10H90v10H80v50h10v10h10v10h10V10h-10z" fill="red" />
      <path d="M10 20v10h10v10H10v10h10v10H10v10h10v10H10v10h10V80h10V70H20V60h10V50H20V40h10V30H20V20H10M0 30v10h10V30H0m0 20v10h10V50H0m0 20v10h10V70H0m0 20v10h10V90H0z" fill="maroon" />
      <path d="M20 90v10H10v10h10v10h70v-10h10v-10H90V90H20z" fill="red" />
      <path d="M0 110v10h10v-10H0z" fill="maroon" />
      <path d="M100 110v10H90v10H80v50h10v10h10v10h10v-90h-10z" fill="red" />
      <path d="M10 120v10h10v-10H10M0 130v10h10v-10H0m20 0v10h10v-10H20m-10 10v10h10v-10H10M0 150v10h10v-10H0m20 0v10h10v-10H20m-10 10v10h10v-10H10M0 170v10h10v-10H0m20 0v10h10v-10H20m-10 10v10h10v-10H10z" fill="maroon" />
      <path d="M30 180v10H20v10H10v10h90v-10H90v-10H80v-10H30z" fill="red" />
      <path d="M0 190v10h10v-10H0z" fill="maroon" />
    </symbol>
    <symbol id="count-4">
      <path d="M0 0v10h10v10h10v10h10v50H20v10H10v10H0v10h10v10H0v10h10v10H0v10h10v10H0v10h10v10H0v10h10v10H0v10h20v-10h10v10h10v-10h10v10h10v-10h10v10h10v-10h10v10h20v-10h-10v-10H90v-10H80v-50h10v-10h10v-10h10v-10h-10V90H90V80H80V30h10V20h10V10h10V0H90v10H80V0H70v10H60V0H50v10H40V0H30v10H20V0H0z" />
      <path d="M20 0v10h10V0H20m20 0v10h10V0H40m20 0v10h10V0H60m20 0v10h10V0H80z" fill="maroon" />
      <path d="M0 10v90h10V90h10V80h10V30H20V20H10V10H0z" fill="red" />
      <path d="M30 10v10h10v10h10V20h10v10h10V20h10V10H70v10H60V10H50v10H40V10H30z" fill="maroon" />
      <path d="M100 10v10H90v10H80v50h10v10h10v10h10V10h-10M20 90v10H10v10h10v10h70v-10h10v-10H90V90H20z" fill="red" />
      <path d="M0 110v10h10v-10H0z" fill="maroon" />
      <path d="M100 110v10H90v10H80v50h10v10h10v10h10v-90h-10z" fill="red" />
      <path d="M10 120v10h10v-10H10M0 130v10h10v-10H0m20 0v10h10v-10H20m-10 10v10h10v-10H10M0 150v10h10v-10H0m20 0v10h10v-10H20m-10 10v10h10v-10H10M0 170v10h10v-10H0m20 0v10h10v-10H20m-10 10v10h10v-10H10m30 0v10H30v10h10v-10h10v10h10v-10h10v10h10v-10H70v-10H60v10H50v-10H40M0 190v10h10v-10H0m20 10v10h10v-10H20m20 0v10h10v-10H40m20 0v10h10v-10H60m20 0v10h10v-10H80z" fill="maroon" />
    </symbol>
    <symbol id="count-5">
      <path d="M0 0v10h10v10h10v10h10v50H20v10H10v10H0v10h10v10H0v10h10v10H0v10h10v10H0v10h10v10H0v10h10v10H0v10h10v-10h10v-10h10v-10h50v10h10v10h10v10h10v-10h-10v-10H90v-10H80v-50h10v-10h10v-10h10v-10h-10V90h10V80h-10V70h10V60h-10V50h10V40h-10V30h10V20h-10V10h10V0h-10v10H90v10H80v10H30V20H20V10H10V0H0z" />
      <path d="M10 0v10h10v10h10v10h50V20h10V10h10V0H10M0 10v90h10V90h10V80h10V30H20V20H10V10H0z" fill="red" />
      <path d="M100 10v10h10V10h-10M90 20v10H80v10h10v10H80v10h10v10H80v10h10v10h10V80H90V70h10V60H90V50h10V40H90V30h10V20H90m10 10v10h10V30h-10m0 20v10h10V50h-10m0 20v10h10V70h-10z" fill="maroon" />
      <path d="M20 90v10H10v10h10v10h70v-10h10v-10H90V90H20z" fill="red" />
      <path d="M100 90v10h10V90h-10M0 110v10h10v-10H0z" fill="maroon" />
      <path d="M100 110v10H90v10H80v50h10v10h10v10h10v-90h-10z" fill="red" />
      <path d="M10 120v10h10v-10H10M0 130v10h10v-10H0m20 0v10h10v-10H20m-10 10v10h10v-10H10M0 150v10h10v-10H0m20 0v10h10v-10H20m-10 10v10h10v-10H10M0 170v10h10v-10H0m20 0v10h10v-10H20m-10 10v10h10v-10H10z" fill="maroon" />
      <path d="M30 180v10H20v10H10v10h90v-10H90v-10H80v-10H30z" fill="red" />
      <path d="M0 190v10h10v-10H0z" fill="maroon" />
    </symbol>
    <symbol id="count-6">
      <path d="M0 0v10h10v10h10v10h10v50H20v10H10v10H0v10h10v10h10v10h10v50H20v10H10v10H0v10h10v-10h10v-10h10v-10h50v10h10v10h10v10h10v-10h-10v-10H90v-10H80v-50h10v-10h10v-10h10v-10h-10V90h10V80h-10V70h10V60h-10V50h10V40h-10V30h10V20h-10V10h10V0h-10v10H90v10H80v10H30V20H20V10H10V0H0z" />
      <path d="M10 0v10h10v10h10v10h50V20h10V10h10V0H10M0 10v90h10V90h10V80h10V30H20V20H10V10H0z" fill="red" />
      <path d="M100 10v10h10V10h-10M90 20v10H80v10h10v10H80v10h10v10H80v10h10v10h10V80H90V70h10V60H90V50h10V40H90V30h10V20H90m10 10v10h10V30h-10m0 20v10h10V50h-10m0 20v10h10V70h-10z" fill="maroon" />
      <path d="M20 90v10H10v10h10v10h70v-10h10v-10H90V90H20z" fill="red" />
      <path d="M100 90v10h10V90h-10z" fill="maroon" />
      <path d="M0 110v90h10v-10h10v-10h10v-50H20v-10H10v-10H0m100 0v10H90v10H80v50h10v10h10v10h10v-90h-10m-70 70v10H20v10H10v10h90v-10H90v-10H80v-10H30z" fill="red" />
    </symbol>
    <symbol id="count-7">
      <path d="M0 0v10h10v10H0v10h10v10H0v10h10v10H0v10h10v10H0v10h10v10H0v10h10v10H0v10h10v10H0v10h10v10H0v10h10v10H0v10h10v10H0v10h20v-10h10v10h10v-10h10v10h10v-10h10v10h10v-10h10v10h20v-10h-10v-10H90v-10H80v-50h10v-10h10v-10h10v-10h-10V90H90V80H80V30h10V20h10V10h10V0h-10v10H90v10H80v10H30V20H20V10H10V0H0z" />
      <path d="M10 0v10h10v10h10v10h50V20h10V10h10V0H10z" fill="red" />
      <path d="M0 10v10h10V10H0z" fill="maroon" />
      <path d="M100 10v10H90v10H80v50h10v10h10v10h10V10h-10z" fill="red" />
      <path d="M10 20v10h10v10H10v10h10v10H10v10h10v10H10v10h10V80h10V70H20V60h10V50H20V40h10V30H20V20H10M0 30v10h10V30H0m0 20v10h10V50H0m0 20v10h10V70H0m0 20v10h10V90H0m30 0v10H20v10h10v10h10v-10h10v10h10v-10h10v10h10v-10h10v-10H80V90H70v10H60V90H50v10H40V90H30z" fill="maroon" />
      <path d="M30 100v10h10v-10H30m20 0v10h10v-10H50m20 0v10h10v-10H70z" />
      <path d="M0 110v10h10v-10H0z" fill="maroon" />
      <path d="M100 110v10H90v10H80v50h10v10h10v10h10v-90h-10z" fill="red" />
      <path d="M10 120v10h10v10H10v10h10v10H10v10h10v10H10v10h10v-10h10v-10H20v-10h10v-10H20v-10h10v-10H20v-10H10M0 130v10h10v-10H0m0 20v10h10v-10H0m0 20v10h10v-10H0m40 10v10H30v10h10v-10h10v10h10v-10h10v10h10v-10H70v-10H60v10H50v-10H40M0 190v10h10v-10H0m20 10v10h10v-10H20m20 0v10h10v-10H40m20 0v10h10v-10H60m20 0v10h10v-10H80z" fill="maroon" />
    </symbol>
    <symbol id="count-8">
      <path d="M0 0v10h10v10h10v10h10v50H20v10H10v10H0v10h10v10h10v10h10v50H20v10H10v10H0v10h10v-10h10v-10h10v-10h50v10h10v10h10v10h10v-10h-10v-10H90v-10H80v-50h10v-10h10v-10h10v-10h-10V90H90V80H80V30h10V20h10V10h10V0h-10v10H90v10H80v10H30V20H20V10H10V0H0z" />
      <path d="M10 0v10h10v10h10v10h50V20h10V10h10V0H10M0 10v90h10V90h10V80h10V30H20V20H10V10H0m100 0v10H90v10H80v50h10v10h10v10h10V10h-10M20 90v10H10v10h10v10h70v-10h10v-10H90V90H20M0 110v90h10v-10h10v-10h10v-50H20v-10H10v-10H0m100 0v10H90v10H80v50h10v10h10v10h10v-90h-10m-70 70v10H20v10H10v10h90v-10H90v-10H80v-10H30z" fill="red" />
    </symbol>
    <symbol id="count-9">
      <path d="M0 0v10h10v10h10v10h10v50H20v10H10v10H0v10h10v10H0v10h10v10H0v10h10v10H0v10h10v10H0v10h10v10H0v10h10v-10h10v-10h10v-10h50v10h10v10h10v10h10v-10h-10v-10H90v-10H80v-50h10v-10h10v-10h10v-10h-10V90H90V80H80V30h10V20h10V10h10V0h-10v10H90v10H80v10H30V20H20V10H10V0H0z" />
      <path d="M10 0v10h10v10h10v10h50V20h10V10h10V0H10M0 10v90h10V90h10V80h10V30H20V20H10V10H0m100 0v10H90v10H80v50h10v10h10v10h10V10h-10M20 90v10H10v10h10v10h70v-10h10v-10H90V90H20z" fill="red" />
      <path d="M0 110v10h10v-10H0z" fill="maroon" />
      <path d="M100 110v10H90v10H80v50h10v10h10v10h10v-90h-10z" fill="red" />
      <path d="M10 120v10h10v-10H10M0 130v10h10v-10H0m20 0v10h10v-10H20m-10 10v10h10v-10H10M0 150v10h10v-10H0m20 0v10h10v-10H20m-10 10v10h10v-10H10M0 170v10h10v-10H0m20 0v10h10v-10H20m-10 10v10h10v-10H10z" fill="maroon" />
      <path d="M30 180v10H20v10H10v10h90v-10H90v-10H80v-10H30z" fill="red" />
      <path d="M0 190v10h10v-10H0z" fill="maroon" />
    </symbol>
    <symbol id="count-minus">
      <path d="M0 0v10h10v10H0v10h10v10H0v10h10v10H0v10h10v10H0v10h10v10H0v10h10v10H0v10h10v10H0v10h10v10H0v10h10v10H0v10h10v10H0v10h20v-10h10v10h10v-10h10v10h10v-10h10v10h10v-10h10v10h20v-10h-10v-10h10v-10h-10v-10h10v-10h-10v-10h10v-10h-10v-10h10v-10h-10v-10h10v-10h-10V90h10V80h-10V70h10V60h-10V50h10V40h-10V30h10V20h-10V10h10V0H90v10H80V0H70v10H60V0H50v10H40V0H30v10H20V0H0z" />
      <path d="M20 0v10h10V0H20m20 0v10h10V0H40m20 0v10h10V0H60m20 0v10h10V0H80M0 10v10h10V10H0m30 0v10h10v10h10V20h10v10h10V20h10V10H70v10H60V10H50v10H40V10H30m70 0v10h10V10h-10M10 20v10h10v10H10v10h10v10H10v10h10v10H10v10h10V80h10V70H20V60h10V50H20V40h10V30H20V20H10m80 0v10h10V20H90M0 30v10h10V30H0m80 0v10h10V30H80m20 0v10h10V30h-10M90 40v10h10V40H90M0 50v10h10V50H0m80 0v10h10V50H80m20 0v10h10V50h-10M90 60v10h10V60H90M0 70v10h10V70H0m80 0v10h10V70H80m20 0v10h10V70h-10M90 80v10h10V80H90M0 90v10h10V90H0z" fill="maroon" />
      <path d="M20 90v10H10v10h10v10h70v-10h10v-10H90V90H20z" fill="red" />
      <path d="M100 90v10h10V90h-10M0 110v10h10v-10H0m100 0v10h10v-10h-10m-90 10v10h10v-10H10m80 0v10h10v-10H90M0 130v10h10v-10H0m20 0v10h10v-10H20m60 0v10h10v-10H80m20 0v10h10v-10h-10m-90 10v10h10v-10H10m80 0v10h10v-10H90M0 150v10h10v-10H0m20 0v10h10v-10H20m60 0v10h10v-10H80m20 0v10h10v-10h-10m-90 10v10h10v-10H10m80 0v10h10v-10H90M0 170v10h10v-10H0m20 0v10h10v-10H20m60 0v10h10v-10H80m20 0v10h10v-10h-10m-90 10v10h10v-10H10m30 0v10H30v10h10v-10h10v10h10v-10h10v10h10v-10H70v-10H60v10H50v-10H40m50 0v10h10v-10H90M0 190v10h10v-10H0m100 0v10h10v-10h-10m-80 10v10h10v-10H20m20 0v10h10v-10H40m20 0v10h10v-10H60m20 0v10h10v-10H80z" fill="maroon" />
    </symbol>
    <symbol id="face-lose">
      <path d="M0 0v250h10v10h250V10h-10V0H0z" fill="gray" />
      <path d="M250 0v10h10V0h-10z" fill="silver" />
      <path d="M10 10v230h10v-10h10V30h200V20h10V10H10z" fill="white" />
      <path d="M240 10v10h10V10h-10m-10 10v10h10V20h-10M30 30v200h200V30H30z" fill="silver" />
      <path d="M110 50v10H90v10H80v10H70v10H60v20H50v50h10v20h10v10h10v10h10v10h20v10h50v-10h20v-10h10v-10h10v-10h10v-20h10v-50h-10V90h-10V80h-10V70h-10V60h-20V50h-50z" />
      <path d="M110 60v10H90v10H80v10H70v20H60v50h10v20h10v10h10v10h20v10h50v-10h20v-10h10v-10h10v-20h10v-50h-10V90h-10V80h-10V70h-20V60h-50z" fill="#ff0" />
      <path d="M90 90v10h10v10H90v10h10v-10h10v10h10v-10h-10v-10h10V90h-10v10h-10V90H90m60 0v10h10v10h-10v10h10v-10h10v10h10v-10h-10v-10h10V90h-10v10h-10V90h-10m-40 60v10h-10v10H90v10h10v-10h10v-10h50v10h10v10h10v-10h-10v-10h-10v-10h-50z" />
      <path d="M20 230v10h10v-10H20m-10 10v10h10v-10H10M0 250v10h10v-10H0z" fill="silver" />
    </symbol>
    <symbol id="face-normal">
      <path d="M0 0v250h10v10h250V10h-10V0H0z" fill="gray" />
      <path d="M250 0v10h10V0h-10z" fill="silver" />
      <path d="M10 10v230h10v-10h10V30h200V20h10V10H10z" fill="white" />
      <path d="M240 10v10h10V10h-10m-10 10v10h10V20h-10M30 30v200h200V30H30z" fill="silver" />
      <path d="M110 50v10H90v10H80v10H70v10H60v20H50v50h10v20h10v10h10v10h10v10h20v10h50v-10h20v-10h10v-10h10v-10h10v-20h10v-50h-10V90h-10V80h-10V70h-10V60h-20V50h-50z" />
      <path d="M110 60v10H90v10H80v10H70v20H60v50h10v20h10v10h10v10h20v10h50v-10h20v-10h10v-10h10v-20h10v-50h-10V90h-10V80h-10V70h-20V60h-50z" fill="#ff0" />
      <path d="M100 100v20h20v-20h-20m50 0v20h20v-20h-20m-60 50v10h10v10h10v10h50v-10h10v-10h10v-10h-10v10h-10v10h-50v-10h-10v-10H90z" />
      <path d="M20 230v10h10v-10H20m-10 10v10h10v-10H10M0 250v10h10v-10H0z" fill="silver" />
    </symbol>
    <symbol id="face-press-cell">
      <path d="M0 0v250h10v10h250V10h-10V0H0z" fill="gray" />
      <path d="M250 0v10h10V0h-10z" fill="silver" />
      <path d="M10 10v230h10v-10h10V30h200V20h10V10H10z" fill="white" />
      <path d="M240 10v10h10V10h-10m-10 10v10h10V20h-10M30 30v200h200V30H30z" fill="silver" />
      <path d="M110 50v10H90v10H80v10H70v10H60v20H50v50h10v20h10v10h10v10h10v10h20v10h50v-10h20v-10h10v-10h10v-10h10v-20h10v-50h-10V90h-10V80h-10V70h-10V60h-20V50h-50z" />
      <path d="M110 60v10H90v10H80v10H70v20H60v50h10v20h10v10h10v10h20v10h50v-10h20v-10h10v-10h10v-20h10v-50h-10V90h-10V80h-10V70h-20V60h-50z" fill="#ff0" />
      <path d="M90 90v10h10V90H90z" fill="olive" />
      <path d="M100 90v10H90v10h10v10h10v-10h10v-10h-10V90h-10z" />
      <path d="M110 90v10h10V90h-10m40 0v10h10V90h-10z" fill="olive" />
      <path d="M160 90v10h-10v10h10v10h10v-10h10v-10h-10V90h-10z" />
      <path d="M170 90v10h10V90h-10m-80 20v10h10v-10H90m20 0v10h10v-10h-10m40 0v10h10v-10h-10m20 0v10h10v-10h-10z" fill="olive" />
      <path d="M120 140v20h-10v10h10v20h30v-20h10v-10h-10v-20h-30z" />
      <path d="M110 150v10h10v-10h-10z" fill="olive" />
      <path d="M130 150v10h-10v10h10v10h10v-10h10v-10h-10v-10h-10z" fill="#ff0" />
      <path d="M150 150v10h10v-10h-10m-40 20v10h10v-10h-10m40 0v10h10v-10h-10z" fill="olive" />
      <path d="M20 230v10h10v-10H20m-10 10v10h10v-10H10M0 250v10h10v-10H0z" fill="silver" />
    </symbol>
    <symbol id="face-press-normal">
      <path d="M0 0v250h10v10h250V10h-10V0H0z" fill="gray" />
      <path d="M250 0v10h10V0h-10M20 20v230h230V20H20z" fill="silver" />
      <path d="M120 60v10h-20v10H90v10H80v10H70v20H60v50h10v20h10v10h10v10h10v10h20v10h50v-10h20v-10h10v-10h10v-10h10v-20h10v-50h-10v-20h-10V90h-10V80h-10V70h-20V60h-50z" />
      <path d="M120 70v10h-20v10H90v10H80v20H70v50h10v20h10v10h10v10h20v10h50v-10h20v-10h10v-10h10v-20h10v-50h-10v-20h-10V90h-10V80h-20V70h-50z" fill="#ff0" />
      <path d="M110 110v20h20v-20h-20m50 0v20h20v-20h-20m-60 50v10h10v10h10v10h50v-10h10v-10h10v-10h-10v10h-10v10h-50v-10h-10v-10h-10z" />
      <path d="M0 250v10h10v-10H0z" fill="silver" />
    </symbol>
    <symbol id="face-win">
      <path d="M0 0v250h10v10h250V10h-10V0H0z" fill="gray" />
      <path d="M250 0v10h10V0h-10z" fill="silver" />
      <path d="M10 10v230h10v-10h10V30h200V20h10V10H10z" fill="white" />
      <path d="M240 10v10h10V10h-10m-10 10v10h10V20h-10M30 30v200h200V30H30z" fill="silver" />
      <path d="M110 50v10H90v10H80v10H70v10H60v20H50v50h10v20h10v10h10v10h10v10h20v10h50v-10h20v-10h10v-10h10v-10h10v-20h10v-50h-10V90h-10V80h-10V70h-10V60h-20V50h-50z" />
      <path d="M110 60v10H90v10H80v10H70v20H60v20h10v10H60v20h10v20h10v10h10v10h20v10h50v-10h20v-10h10v-10h10v-20h10v-20h-10v-10h10v-20h-10V90h-10V80h-10V70h-20V60h-50z" fill="#ff0" />
      <path d="M90 100v10H80v10H70v10h10v-10h10v10h10v10h20v-10h10v-20h10v20h10v10h20v-10h10v-10h10v10h10v-10h-10v-10h-10v-10H90z" />
      <path d="M90 130v10h10v-10H90m80 0v10h10v-10h-10z" fill="olive" />
      <path d="M100 160v10h10v10h50v-10h10v-10h-10v10h-50v-10h-10z" />
      <path d="M20 230v10h10v-10H20m-10 10v10h10v-10H10M0 250v10h10v-10H0z" fill="silver" />
    </symbol>
    <symbol id="top-counters">
      <path d="M0 0v240h10V10h390V0H0z" fill="gray" />
      <path d="M400 0v10h10V0h-10z" fill="silver" />
      <path d="M10 10v230h390V10H10z" />
      <path d="M400 10v230H10v10h400V10h-10z" fill="white" />
      <path d="M40 20v10h10v10h10v10h10V40h10v10h10V40h10V30h10V20h-10v10H90V20H80v10H70V20H60v10H50V20H40m130 0v10h10v10h10v10h10V40h10v10h10V40h10V30h10V20h-10v10h-10V20h-10v10h-10V20h-10v10h-10V20h-10m130 0v10h10v10h10v10h10V40h10v10h10V40h10V30h10V20h-10v10h-10V20h-10v10h-10V20h-10v10h-10V20h-10M20 30v10h10v10H20v10h10v10H20v10h10v10H20v10h10v10H20v10h10v-10h10v-10h10V90H40V80h10V70H40V60h10V50H40V40H30V30H20z" fill="maroon" />
      <path d="M60 30v10h10V30H60m20 0v10h10V30H80z" />
      <path d="M120 30v10h-10v10h-10v10h10v10h-10v10h10v10h-10v10h10v10h10v10h10v-10h-10v-10h10V90h-10V80h10V70h-10V60h10V50h-10V40h10V30h-10m30 0v10h10v10h-10v10h10v10h-10v10h10v10h-10v10h10v10h-10v10h10v-10h10v-10h10V90h-10V80h10V70h-10V60h10V50h-10V40h-10V30h-10z" fill="maroon" />
      <path d="M190 30v10h10V30h-10m20 0v10h10V30h-10z" />
      <path d="M250 30v10h-10v10h-10v10h10v10h-10v10h10v10h-10v10h10v10h10v10h10v-10h-10v-10h10V90h-10V80h10V70h-10V60h10V50h-10V40h10V30h-10m30 0v10h10v10h-10v10h10v10h-10v10h10v10h-10v10h10v10h-10v10h10v-10h10v-10h10V90h-10V80h10V70h-10V60h10V50h-10V40h-10V30h-10z" fill="maroon" />
      <path d="M320 30v10h10V30h-10m20 0v10h10V30h-10z" />
      <path d="M380 30v10h-10v10h-10v10h10v10h-10v10h10v10h-10v10h10v10h10v10h10v-10h-10v-10h10V90h-10V80h10V70h-10V60h10V50h-10V40h10V30h-10z" fill="maroon" />
      <path d="M30 50v10h10V50H30m80 0v10h10V50h-10m50 0v10h10V50h-10m80 0v10h10V50h-10m50 0v10h10V50h-10m80 0v10h10V50h-10M30 70v10h10V70H30m80 0v10h10V70h-10m50 0v10h10V70h-10m80 0v10h10V70h-10m50 0v10h10V70h-10m80 0v10h10V70h-10M30 90v10h10V90H30m80 0v10h10V90h-10m50 0v10h10V90h-10m80 0v10h10V90h-10m50 0v10h10V90h-10m80 0v10h10V90h-10z" />
      <path d="M50 110v10H40v10h10v10h10v-10h10v10h10v-10h10v10h10v-10h10v-10h-10v-10H90v10H80v-10H70v10H60v-10H50m130 0v10h-10v10h10v10h10v-10h10v10h10v-10h10v10h10v-10h10v-10h-10v-10h-10v10h-10v-10h-10v10h-10v-10h-10m130 0v10h-10v10h10v10h10v-10h10v10h10v-10h10v10h10v-10h10v-10h-10v-10h-10v10h-10v-10h-10v10h-10v-10h-10z" fill="maroon" />
      <path d="M50 120v10h10v-10H50m20 0v10h10v-10H70m20 0v10h10v-10H90m90 0v10h10v-10h-10m20 0v10h10v-10h-10m20 0v10h10v-10h-10m90 0v10h10v-10h-10m20 0v10h10v-10h-10m20 0v10h10v-10h-10z" />
      <path d="M20 130v10h10v10H20v10h10v10H20v10h10v10H20v10h10v10H20v10h10v-10h10v-10h10v-10H40v-10h10v-10H40v-10h10v-10H40v-10H30v-10H20m100 0v10h-10v10h-10v10h10v10h-10v10h10v10h-10v10h10v10h10v10h10v-10h-10v-10h10v-10h-10v-10h10v-10h-10v-10h10v-10h-10v-10h10v-10h-10m30 0v10h10v10h-10v10h10v10h-10v10h10v10h-10v10h10v10h-10v10h10v-10h10v-10h10v-10h-10v-10h10v-10h-10v-10h10v-10h-10v-10h-10v-10h-10m100 0v10h-10v10h-10v10h10v10h-10v10h10v10h-10v10h10v10h10v10h10v-10h-10v-10h10v-10h-10v-10h10v-10h-10v-10h10v-10h-10v-10h10v-10h-10m30 0v10h10v10h-10v10h10v10h-10v10h10v10h-10v10h10v10h-10v10h10v-10h10v-10h10v-10h-10v-10h10v-10h-10v-10h10v-10h-10v-10h-10v-10h-10m100 0v10h-10v10h-10v10h10v10h-10v10h10v10h-10v10h10v10h10v10h10v-10h-10v-10h10v-10h-10v-10h10v-10h-10v-10h10v-10h-10v-10h10v-10h-10z" fill="maroon" />
      <path d="M30 150v10h10v-10H30m80 0v10h10v-10h-10m50 0v10h10v-10h-10m80 0v10h10v-10h-10m50 0v10h10v-10h-10m80 0v10h10v-10h-10M30 170v10h10v-10H30m80 0v10h10v-10h-10m50 0v10h10v-10h-10m80 0v10h10v-10h-10m50 0v10h10v-10h-10m80 0v10h10v-10h-10M30 190v10h10v-10H30m80 0v10h10v-10h-10m50 0v10h10v-10h-10m80 0v10h10v-10h-10m50 0v10h10v-10h-10m80 0v10h10v-10h-10z" />
      <path d="M60 200v10H50v10H40v10h10v-10h10v10h10v-10h10v10h10v-10h10v10h10v-10h-10v-10H90v-10H80v10H70v-10H60m130 0v10h-10v10h-10v10h10v-10h10v10h10v-10h10v10h10v-10h10v10h10v-10h-10v-10h-10v-10h-10v10h-10v-10h-10m130 0v10h-10v10h-10v10h10v-10h10v10h10v-10h10v10h10v-10h10v10h10v-10h-10v-10h-10v-10h-10v10h-10v-10h-10z" fill="maroon" />
      <path d="M60 210v10h10v-10H60m20 0v10h10v-10H80m110 0v10h10v-10h-10m20 0v10h10v-10h-10m110 0v10h10v-10h-10m20 0v10h10v-10h-10z" />
      <path d="M0 240v10h10v-10H0z" fill="silver" />
    </symbol>
    <symbol id="background-top">
      <path :d="`M0 0L0 ${countTopHeight}L${boardWidth} ${countTopHeight}L${boardWidth} 0L0 0z`" fill="silver" />
    </symbol>
    <symbol id="cursor-arrow">
      <polygon points="119.72,127.46 70.38,127.46 90.64,168.68 61.19,183.61 38.59,137.28 5.00,170.04 5.00,12.12 " stroke-width="10" style="fill:#7BCEF7;stroke:#424A52;"></polygon>
    </symbol>
  </g>
</template>

<script lang="ts">

import { computed, defineComponent } from 'vue'
import { store } from '@/store'
import { CELL_SIDE_LENGTH, GAME_BOTTOM_MIDDLE, GAME_TOP_MIDDLE, SVG_SCALE } from '@/game/constants'

export default defineComponent({
  setup () {
    // 游戏棋盘宽度
    const boardWidth = computed(() => {
      return store.state.width * CELL_SIDE_LENGTH * SVG_SCALE
    })
    // 游戏棋盘高度
    const boardHeight = computed(() => {
      return store.state.height * CELL_SIDE_LENGTH * SVG_SCALE
    })
    // 顶部计数器高度
    const countTopHeight = GAME_TOP_MIDDLE.height * SVG_SCALE
    // 游戏底部中间部分的高度信息
    const gameBottomMiddleHeight = GAME_BOTTOM_MIDDLE.height * SVG_SCALE
    return { boardWidth, boardHeight, countTopHeight, gameBottomMiddleHeight }
  }
})
</script>
