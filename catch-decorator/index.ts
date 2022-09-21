 import { CatchDecoratorParam, HandlerFunction } from './type'; 

 type DoWithError = {
     tag: string;
     propertyKey: string;
     ctx: unknown;
     error: unknown;
     catchParam?: CatchDecoratorParam;
 };

 function callFunc(ctx, handler?: HandlerFunction) {
     if (handler && typeof handler === 'function') {
         handler(ctx);
     }
 }
 
 function doWithError(params: DoWithError) {
     const { tag, propertyKey, ctx, error, catchParam } = params;
     const { exceptionHandler, errorDescription, needThrow = false } = catchParam || {};
     console.error(errorDescription || `${propertyKey}_error`, error);
     if (exceptionHandler) {
         if (typeof exceptionHandler === 'function') {
             // 如果触发error，且该句柄为函数，执行handler回调。
             exceptionHandler(ctx, error);
         } else {
             throw error;
         }
     }
     if (needThrow) {
         // 如果需要继续抛出异常，那就继续向外抛
         throw error;
     }
 }
 
 function isPromise(result): boolean {
     // 通过res是否包含then方法，判断是否为promise
     // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
     if (result && typeof result.then === 'function' && typeof result.catch === 'function') {
         return true;
     }
     return false;
 }
 
 export const CatchLog =
     (tag: string, catchParam?: CatchDecoratorParam) =>
     (target, propertyKey: string, descriptor: PropertyDescriptor) => {
         const {
             beforeFuncHandler,
             afterFuncHandler,
             needPrintArgs = true,
             onlyCatch = false,
         } = catchParam || {};
 
         const originalMethod = descriptor.value;
         descriptor.value = function (...args: unknown[]) {
             try {
                 onlyCatch || console.info(`${propertyKey} invoked`, needPrintArgs ? args : {});
                 callFunc(this, beforeFuncHandler);
                 const result = originalMethod.apply(this, args);
                 if (isPromise(result)) {
                     // 在执行exceptionHandler后，不执行afterFuncHandler
                     let hasError = false;
                     return (result as Promise<unknown>)
                         .catch((error: unknown) => {
                             hasError = true;
                             doWithError({ tag, propertyKey, ctx: this, error, catchParam });
                         })
                         .finally(() => {
                             hasError || callFunc(this, afterFuncHandler);
                         });
                 } else {
                     callFunc(this, afterFuncHandler);
                 }
                 return result;
             } catch (error: unknown) {
                 doWithError({ tag, propertyKey, ctx: this, error, catchParam });
             }
         };
         return descriptor;
     };
 