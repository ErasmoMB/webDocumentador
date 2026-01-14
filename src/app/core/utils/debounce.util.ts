import { Subject, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

export class DebounceUtil {
  private static debounceSubjects: Map<string, Subject<any>> = new Map();

  static debounce<T>(key: string, value: T, delay: number = 300): Observable<T> {
    if (!this.debounceSubjects.has(key)) {
      this.debounceSubjects.set(key, new Subject<T>());
    }
    
    const subject = this.debounceSubjects.get(key)!;
    subject.next(value);
    
    return subject.pipe(
      debounceTime(delay),
      distinctUntilChanged()
    );
  }

  static clear(key: string): void {
    if (this.debounceSubjects.has(key)) {
      this.debounceSubjects.get(key)!.complete();
      this.debounceSubjects.delete(key);
    }
  }

  static clearAll(): void {
    this.debounceSubjects.forEach(subject => subject.complete());
    this.debounceSubjects.clear();
  }
}

