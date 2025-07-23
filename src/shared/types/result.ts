/**
 * Result 타입 - 함수형 프로그래밍의 Either 패턴 구현
 * 에러 처리를 명시적이고 타입 안전하게 만듭니다.
 */

export type Result<T, E = Error> = Ok<T> | Err<E>;

export interface Ok<T> {
  readonly success: true;
  readonly data: T;
}

export interface Err<E> {
  readonly success: false;
  readonly error: E;
}

// 생성자 함수들
export const ok = <T>(data: T): Ok<T> => ({ success: true, data });
export const err = <E>(error: E): Err<E> => ({ success: false, error });

// 유틸리티 함수들
export const isOk = <T, E>(result: Result<T, E>): result is Ok<T> => result.success;
export const isErr = <T, E>(result: Result<T, E>): result is Err<E> => !result.success;

// 함수형 조합자들
export const map = <T, U, E>(
  result: Result<T, E>,
  fn: (data: T) => U
): Result<U, E> => {
  return isOk(result) ? ok(fn(result.data)) : result;
};

export const flatMap = <T, U, E>(
  result: Result<T, E>,
  fn: (data: T) => Result<U, E>
): Result<U, E> => {
  return isOk(result) ? fn(result.data) : result;
};

export const mapError = <T, E, F>(
  result: Result<T, E>,
  fn: (error: E) => F
): Result<T, F> => {
  return isErr(result) ? err(fn(result.error)) : result;
};

export const unwrap = <T, E>(result: Result<T, E>): T => {
  if (isOk(result)) {
    return result.data;
  }
  throw new Error(`Tried to unwrap error result: ${result.error}`);
};

export const unwrapOr = <T, E>(result: Result<T, E>, defaultValue: T): T => {
  return isOk(result) ? result.data : defaultValue;
};