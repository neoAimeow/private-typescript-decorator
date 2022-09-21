export type HandlerFunction = (ctx?, error?) => void;

export type CatchDecoratorParam = {
    onlyCatch?: boolean;
    // 只在异常出现的时候需要执行的代码（不宜过长）
    exceptionHandler?: HandlerFunction;
    // 函数执行前需要执行的代码（AOP）
    beforeFuncHandler?: HandlerFunction;
    // 函数执行后需要执行的代码(AOP)， 包括异常出现后也会执行。
    afterFuncHandler?: HandlerFunction;
    // 是否打印函数参数（个别场景打印参数会嵌套循环，介时通过beforeFuncHandler去打印）
    needPrintArgs?: boolean;
    // error的基本描述
    errorDescription?: string;
    // 在catch住error的时候，打印完日志，重新将Error抛出。
    needThrow?: boolean;
};
