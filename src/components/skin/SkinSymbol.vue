<template>
  <g :transform="`translate(${translateX} ${translateY})`">
    <background-top v-if="name === 'background-top'" />
    <border-bottom-left v-else-if="name === 'border-bottom-left'" />
    <border-bottom-right v-else-if="name === 'border-bottom-right'" />
    <border-horizontal-bottom v-else-if="name === 'border-horizontal-bottom'" />
    <border-horizontal-middle v-else-if="name === 'border-horizontal-middle'" />
    <border-horizontal-top v-else-if="name === 'border-horizontal-top'" />
    <border-middle-left v-else-if="name === 'border-middle-left'" />
    <border-middle-right v-else-if="name === 'border-middle-right'" />
    <border-top-left v-else-if="name === 'border-top-left'" />
    <border-top-right v-else-if="name === 'border-top-right'" />
    <border-vertical-left-lower v-else-if="name === 'border-vertical-left-lower'" />
    <border-vertical-left-upper v-else-if="name === 'border-vertical-left-upper'" />
    <border-vertical-right-lower v-else-if="name === 'border-vertical-right-lower'" />
    <border-vertical-right-upper v-else-if="name === 'border-vertical-right-upper'" />
    <cell-flag v-else-if="name === 'cell-flag'" />
    <cell-flag-wrong v-else-if="name === 'cell-flag-wrong'" />
    <cell-mine v-else-if="name === 'cell-mine'" />
    <cell-mine-bomb v-else-if="name === 'cell-mine-bomb'" />
    <cell-normal v-else-if="name === 'cell-normal'" />
    <cell-number0 v-else-if="name === 'cell-number-0'" />
    <cell-number1 v-else-if="name === 'cell-number-1'" />
    <cell-number2 v-else-if="name === 'cell-number-2'" />
    <cell-number3 v-else-if="name === 'cell-number-3'" />
    <cell-number4 v-else-if="name === 'cell-number-4'" />
    <cell-number5 v-else-if="name === 'cell-number-5'" />
    <cell-number6 v-else-if="name === 'cell-number-6'" />
    <cell-number7 v-else-if="name === 'cell-number-7'" />
    <cell-number8 v-else-if="name === 'cell-number-8'" />
    <cell-press v-else-if="name === 'cell-press'" />
    <cell-question v-else-if="name === 'cell-question'" />
    <cell-question-press v-else-if="name === 'cell-question-press'" />
    <count0 v-else-if="name === 'count-0'" />
    <count1 v-else-if="name === 'count-1'" />
    <count2 v-else-if="name === 'count-2'" />
    <count3 v-else-if="name === 'count-3'" />
    <count4 v-else-if="name === 'count-4'" />
    <count5 v-else-if="name === 'count-5'" />
    <count6 v-else-if="name === 'count-6'" />
    <count7 v-else-if="name === 'count-7'" />
    <count8 v-else-if="name === 'count-8'" />
    <count9 v-else-if="name === 'count-9'" />
    <count-minus v-else-if="name === 'count-minus'" />
    <cursor-arrow v-else-if="name === 'cursor-arrow'" />
    <face-lose v-else-if="name === 'face-lose'" />
    <face-normal v-else-if="name === 'face-normal'" />
    <face-press-cell v-else-if="name === 'face-press-cell'" />
    <face-press-normal v-else-if="name === 'face-press-normal'" />
    <face-win v-else-if="name === 'face-win'" />
    <game-bottom-lower-center v-else-if="name === 'game-bottom-lower-center'" />
    <game-bottom-lower-left v-else-if="name === 'game-bottom-lower-left'" />
    <game-bottom-lower-right v-else-if="name === 'game-bottom-lower-right'" />
    <game-bottom-middle-center v-else-if="name === 'game-bottom-middle-center'" />
    <game-bottom-middle-left v-else-if="name === 'game-bottom-middle-left'" />
    <game-bottom-middle-right v-else-if="name === 'game-bottom-middle-right'" />
    <game-bottom-upper-center v-else-if="name === 'game-bottom-upper-center'" />
    <game-bottom-upper-left v-else-if="name === 'game-bottom-upper-left'" />
    <game-bottom-upper-right v-else-if="name === 'game-bottom-upper-right'" />
    <top-counters v-else-if="name === 'top-counters'" />
  </g>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import CellNumber0 from '@/components/skin/default/CellNumber0.vue'
import CellNumber1 from '@/components/skin/default/CellNumber1.vue'
import CellNumber2 from '@/components/skin/default/CellNumber2.vue'
import CellNumber3 from '@/components/skin/default/CellNumber3.vue'
import CellNumber4 from '@/components/skin/default/CellNumber4.vue'
import CellNumber5 from '@/components/skin/default/CellNumber5.vue'
import CellNumber6 from '@/components/skin/default/CellNumber6.vue'
import CellNumber7 from '@/components/skin/default/CellNumber7.vue'
import CellNumber8 from '@/components/skin/default/CellNumber8.vue'
import CursorArrow from '@/components/skin/default/CursorArrow.vue'
import CellFlag from '@/components/skin/default/CellFlag.vue'
import CellFlagWrong from '@/components/skin/default/CellFlagWrong.vue'
import CellMine from '@/components/skin/default/CellMine.vue'
import CellMineBomb from '@/components/skin/default/CellMineBomb.vue'
import CellNormal from '@/components/skin/default/CellNormal.vue'
import CellPress from '@/components/skin/default/CellPress.vue'
import CellQuestion from '@/components/skin/default/CellQuestion.vue'
import CellQuestionPress from '@/components/skin/default/CellQuestionPress.vue'
import Count0 from '@/components/skin/default/Count0.vue'
import Count1 from '@/components/skin/default/Count1.vue'
import Count2 from '@/components/skin/default/Count2.vue'
import Count3 from '@/components/skin/default/Count3.vue'
import Count4 from '@/components/skin/default/Count4.vue'
import Count5 from '@/components/skin/default/Count5.vue'
import Count6 from '@/components/skin/default/Count6.vue'
import Count7 from '@/components/skin/default/Count7.vue'
import Count8 from '@/components/skin/default/Count8.vue'
import Count9 from '@/components/skin/default/Count9.vue'
import CountMinus from '@/components/skin/default/CountMinus.vue'
import FaceLose from '@/components/skin/default/FaceLose.vue'
import FaceNormal from '@/components/skin/default/FaceNormal.vue'
import FacePressCell from '@/components/skin/default/FacePressCell.vue'
import FacePressNormal from '@/components/skin/default/FacePressNormal.vue'
import FaceWin from '@/components/skin/default/FaceWin.vue'
import TopCounters from '@/components/skin/default/TopCounters.vue'
import GameBottomUpperLeft from '@/components/skin/default/GameBottomUpperLeft.vue'
import GameBottomLowerCenter from '@/components/skin/default/GameBottomLowerCenter.vue'
import GameBottomLowerLeft from '@/components/skin/default/GameBottomLowerLeft.vue'
import GameBottomLowerRight from '@/components/skin/default/GameBottomLowerRight.vue'
import GameBottomMiddleCenter from '@/components/skin/default/GameBottomMiddleCenter.vue'
import GameBottomMiddleLeft from '@/components/skin/default/GameBottomMiddleLeft.vue'
import GameBottomMiddleRight from '@/components/skin/default/GameBottomMiddleRight.vue'
import GameBottomUpperCenter from '@/components/skin/default/GameBottomUpperCenter.vue'
import GameBottomUpperRight from '@/components/skin/default/GameBottomUpperRight.vue'
import BackgroundTop from '@/components/skin/default/BackgroundTop.vue'
import BorderBottomLeft from '@/components/skin/default/BorderBottomLeft.vue'
import BorderBottomRight from '@/components/skin/default/BorderBottomRight.vue'
import BorderHorizontalBottom from '@/components/skin/default/BorderHorizontalBottom.vue'
import BorderHorizontalMiddle from '@/components/skin/default/BorderHorizontalMiddle.vue'
import BorderHorizontalTop from '@/components/skin/default/BorderHorizontalTop.vue'
import BorderMiddleLeft from '@/components/skin/default/BorderMiddleLeft.vue'
import BorderMiddleRight from '@/components/skin/default/BorderMiddleRight.vue'
import BorderTopLeft from '@/components/skin/default/BorderTopLeft.vue'
import BorderTopRight from '@/components/skin/default/BorderTopRight.vue'
import BorderVerticalLeftLower from '@/components/skin/default/BorderVerticalLeftLower.vue'
import BorderVerticalLeftUpper from '@/components/skin/default/BorderVerticalLeftUpper.vue'
import BorderVerticalRightLower from '@/components/skin/default/BorderVerticalRightLower.vue'
import BorderVerticalRightUpper from '@/components/skin/default/BorderVerticalRightUpper.vue'

export default defineComponent({
  components: { BorderVerticalRightUpper, BorderVerticalRightLower, BorderVerticalLeftUpper, BorderVerticalLeftLower, BorderTopRight, BorderTopLeft, BorderMiddleRight, BorderMiddleLeft, BorderHorizontalTop, BorderHorizontalMiddle, BorderHorizontalBottom, BorderBottomRight, BorderBottomLeft, BackgroundTop, GameBottomUpperRight, GameBottomUpperCenter, GameBottomMiddleRight, GameBottomMiddleLeft, GameBottomMiddleCenter, GameBottomLowerRight, GameBottomLowerLeft, GameBottomLowerCenter, GameBottomUpperLeft, TopCounters, FaceWin, FacePressNormal, FacePressCell, FaceNormal, FaceLose, CountMinus, Count9, Count8, Count7, Count6, Count5, Count4, Count3, Count2, Count1, Count0, CellQuestionPress, CellQuestion, CellPress, CellNormal, CellMineBomb, CellMine, CellFlagWrong, CellFlag, CursorArrow, CellNumber8, CellNumber7, CellNumber6, CellNumber5, CellNumber4, CellNumber3, CellNumber2, CellNumber1, CellNumber0 },
  props: {
    name: {
      type: String,
      required: true
    },
    translateX: {
      type: Number,
      required: true
    },
    translateY: {
      type: Number,
      required: true
    }
  }
})
</script>
