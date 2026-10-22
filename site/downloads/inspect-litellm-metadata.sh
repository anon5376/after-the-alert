#!/bin/bash

usage() {
  printf '%s\n' 'Usage: bash inspect-litellm-metadata.sh /path/to/site-packages

Inspect immediate entries in one explicitly supplied site-packages directory.
No recursive scan. Symlink entries and directory-path components are not followed.
Supply a physical path without symlink components (including system aliases).
Only matching basenames are printed, with Bash escaping for unusual characters.
No file contents or symlink targets are printed. No Python or pip is started.
Exit 0 means inspection completed, not clearance. Input/access errors: 2.'
}

if [[ $# -eq 1 && $1 == --help ]]; then
  usage
  exit 0
fi
if [[ $# -ne 1 || -z $1 ]]; then
  usage >&2
  exit 2
fi

directory=$1
while [[ $directory != / && $directory == */ ]]; do
  directory=${directory%/}
done

remaining=$directory
prefix=.
if [[ $directory == /* ]]; then
  prefix=/
  remaining=${remaining#/}
fi
while [[ -n $remaining ]]; do
  component=${remaining%%/*}
  if [[ $remaining == */* ]]; then
    remaining=${remaining#*/}
  else
    remaining=
  fi
  [[ -z $component || $component == . ]] && continue
  prefix=${prefix%/}/$component
  if [[ -L $prefix ]]; then
    printf '%s\n' 'Error: symlink directory-path components are not followed. Supply a physical path.' >&2
    exit 2
  fi
done
if [[ ! -d $directory || ! -r $directory || ! -x $directory ]]; then
  printf '%s\n' 'Error: supply an existing, readable, searchable directory.' >&2
  exit 2
fi

shopt -s nullglob dotglob
matches=0
skipped=0
printf '%s\n' 'AS_OF	2026-10-22' 'SCOPE	Immediate directory entries only; no recursive scan.'
for entry in "$directory"/*; do
  if [[ -L $entry ]]; then
    skipped=$((skipped + 1))
    continue
  fi
  name=${entry##*/}
  if [[ -d $entry && $name == litellm-*.dist-info ]]; then
    if [[ $name == litellm-1.107.0.dist-info ]]; then
      category=AFFECTED_ARTIFACT_METADATA
    else
      category=OTHER_LITELLM_METADATA
    fi
  elif [[ -f $entry && ( $name == cook.pth || $name == cook.py || $name == sitecustomize.py ) ]]; then
    category=MARKER_REVIEW_REQUIRED
  else
    continue
  fi
  printf '%s\t%q\n' "$category" "$name"
  matches=$((matches + 1))
done

if [[ $matches -eq 0 ]]; then
  printf '%s\n' 'NO_MATCHING_REGULAR_ENTRIES'
fi
if [[ $skipped -gt 0 ]]; then
  printf 'SYMLINK_ENTRIES_SKIPPED\t%s\n' "$skipped"
fi
printf '%s\n' \
  '1.107.0 metadata indicates an installed affected artifact; it is not proof of payload execution.' \
  'Other LiteLLM metadata versions do not establish that this environment is clean.' \
  'Marker filenames are generic and require review; they are not conclusive proof of malware.' \
  'Marker absence cannot clear historical exposure. This inspection does not inspect containers or other environments.' \
  'Source: https://docs.litellm.ai/blog/security-incident-oct-21-2026' \
  'Do not start Python or pip in a suspected environment; follow the vendor incident response guidance.' \
  'Exit 0 means inspection completed; it does not mean safe.'
