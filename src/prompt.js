import { createInterface } from 'readline';

function ask(question) {
  const rl = createInterface({ input: process.stdin, output: process.stderr });
  return new Promise(resolve => {
    rl.question(question, answer => { rl.close(); resolve(answer); });
  });
}

export const confirm   = async (q) => /^[sS]$/.test(await ask(q));
export const waitEnter = (msg) => ask(msg);
