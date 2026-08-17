import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const isProduction = process.env.NODE_ENV === 'production';

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'حدث خطأ غير متوقع';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exResponse = exception.getResponse();

      if (isProduction && status >= 500) {
        message = 'حدث خطأ في الخادم — يرجى المحاولة لاحقاً';
      } else {
        message =
          typeof exResponse === 'string'
            ? exResponse
            : (exResponse as any)?.message || exception.message;
      }
    } else if (exception instanceof Error) {
      if (isProduction) {
        message = 'حدث خطأ في الخادم — يرجى المحاولة لاحقاً';
      } else {
        message = exception.message;
      }
    }

    this.logger.error(
      `[${status}] ${exception instanceof Error ? exception.message : 'Unknown error'}`,
    );

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
