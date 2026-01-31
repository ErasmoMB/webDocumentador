import { Observable } from 'rxjs';

export interface ICommand<TInput = any, TResult = any> {
  execute(input: TInput): Observable<TResult>;
  canExecute?(input: TInput): boolean;
  undo?(): Observable<void>;
}

export interface ICommandHandler<TCommand extends ICommand<any, any>> {
  handle(command: TCommand): Observable<ReturnType<TCommand['execute']>>;
}

export interface IQuery<TResult = any> {
  execute(): Observable<TResult>;
}

export interface IQueryHandler<TQuery extends IQuery<any>> {
  handle(query: TQuery): Observable<ReturnType<TQuery['execute']>>;
}
