function get(argOrArgs:string | string[]): string | string[] {

  let args:string[] = [].concat(argOrArgs);
  let data = {
    'a': 1,
    'b': 2,
    'c': 3
  };

  return args.length === 1 ? data[args[0]] : args.map(arg => data[arg]);

}

console.log(get('a'))
