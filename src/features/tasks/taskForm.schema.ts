import { z } from 'zod'

export const taskFormSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  description: z.string().trim().min(1, 'Description is required'),
  assignee: z.string().trim().min(1, 'Assignee is required'),
  status: z.enum(['todo', 'in_progress', 'done']),
  priority: z.enum(['low', 'medium', 'high']),
  tags: z.string().trim(),
})

export type TaskFormValues = z.infer<typeof taskFormSchema>
