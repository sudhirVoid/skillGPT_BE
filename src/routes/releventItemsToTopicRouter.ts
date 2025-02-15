import { Router,Request,Response} from "express";

const router = Router();
router.get('/releventBlogPosts', (req:Request, res:Response) => {
  res.status(200).json({ 'name': 'Hello from other world.' })
})
router.get('/releventVideos', (req:Request, res:Response) => {
    res.status(200).json({ 'name': 'Hello from other world.' })
})
router.get('/releventJobs', (req:Request, res:Response) => {
    res.status(200).json({ 'name': 'Hello from other world.' })
})
export default router;