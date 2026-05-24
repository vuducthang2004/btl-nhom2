import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';
import { HttpStatus } from '../constants/http-status.js';

interface ValidationTarget {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
}

export function validate(schemas: ValidationTarget) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: { field: string; message: string }[] = [];

    for (const [key, schema] of Object.entries(schemas)) {
      if (!schema) continue;

      const source = req[key as keyof Pick<Request, 'body' | 'params' | 'query'>];
      const result = schema.safeParse(source);

      if (!result.success) {
        for (const issue of result.error.issues) {
          errors.push({
            field: `${key}.${issue.path.join('.')}`,
            message: issue.message,
          });
        }
      } else {
        // Replace with parsed (coerced/transformed) values
        // Express 5: req.query is read-only getter, so assign parsed data differently
        if (key === 'query') {
          (req as any)._parsedQuery = result.data;
          Object.defineProperty(req, 'query', { value: result.data, writable: true, configurable: true });
        } else {
          Object.assign(req, { [key]: result.data });
        }
      }
    }

    if (errors.length > 0) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
      return;
    }

    next();
  };
}
