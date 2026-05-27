# `@workspace/config`

Shared .env validated variables

## Accessing variables

```ts
// packages/config/index.ts
import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  server: {
    VARIABLE: z.string().min(1).url(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
})


// file.ts
import { env } from '@workspace/config'

console.log(env.VARIABLE)
```
