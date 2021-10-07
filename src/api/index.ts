export const fetchVideo = (url: string, cb: (data: ArrayBuffer) => void): void => {
  // TODO 完善录像数据获取逻辑，添加出错处理和预处理（如后缀名判断等）
  const request = new XMLHttpRequest()
  request.onload = () => {
    cb(request.response)
  }
  request.open('GET', url)
  request.responseType = 'arraybuffer'
  request.send()
}
