// @flow

import { isEqual, cloneDeep, merge, assign, uniq } from "lodash";

// is a subset of b?
function isSubset(a: Object, b: Object, shouldMerge: boolean = false): boolean {
  const func = shouldMerge ? merge : assign;
  const c = func(cloneDeep(b), a);
  return isEqual(c, b);
}

function computeChangeSet(
  current: Array<string>,
  desired: Array<string>,
): Object {
  const add = uniq(desired.filter(d => !current.includes(d)));
  const remove = uniq(current.filter(c => !desired.includes(c)));
  return {
    add,
    remove,
  };
}

export { isSubset, computeChangeSet };
