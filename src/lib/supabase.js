import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://zehwsrjfwgdrmnnclezl.supabase.co'
const SUPABASE_KEY = 'sb_publishable_BMWfC_3FdJkW7RMqYW1tcQ_cj79O7Y1'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
