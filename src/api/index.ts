import { data } from '@/api/mock-data'

export const fetchVideo = (url: string, cb: (data: string) => void): void => {
  cb(data)
}
