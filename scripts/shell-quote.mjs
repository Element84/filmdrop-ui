/**
 * POSIX shell single-quote wrapping for use in printed `npm run ...` examples
 * (bash, zsh, Git Bash). Not for cmd.exe.
 */
export function quotePosixShellArg(value) {
  const s = String(value)
  return `'${s.replace(/'/g, "'\\''")}'`
}
