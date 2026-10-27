import { nonempty } from './common.mjs';
export function route(request, options = {}) {
  nonempty(request, 'request');
  for (const key of ['risk', 'uncertainty'])
    if (options[key] && !['low', 'medium', 'high'].includes(options[key]))
      throw Error(`Invalid ${key}`);
  const security =
    /\b(auth(?:entication|orization)?|payment|permission|credential|secret|security|encryption|migration)\b/i.test(
      request,
    );
  const release = /\b(release|deploy(?:ment)?|launch checklist|demo readiness)\b/i.test(request);
  const complex =
    /\b(new (?:app(?:lication)?|product|project)|unclear|architect(?:ure)?|major refactor|plan this idea)\b/i.test(
      request,
    );
  const tiny =
    /\b(typo|label|text change|button (?:fix|color)|simple css|spacing|tiny|one.line)\b/i.test(
      request,
    );
  const mode = release
    ? 'RELEASE'
    : security || complex || options.risk === 'high' || options.uncertainty === 'high'
      ? 'DEEP'
      : tiny
        ? 'QUICK'
        : 'STANDARD';
  const selected = options.mode?.toUpperCase() || mode;
  if (!['QUICK', 'STANDARD', 'DEEP', 'RELEASE'].includes(selected)) throw Error('Invalid mode');
  return {
    mode: selected,
    suggested: mode,
    risk: security ? 'high' : options.risk || 'medium',
    reason: release
      ? 'Release intent'
      : security
        ? 'Sensitive trust/data boundary'
        : complex
          ? 'Product/architecture uncertainty'
          : options.risk === 'high' || options.uncertainty === 'high'
            ? 'Explicit high risk or uncertainty'
            : tiny
              ? 'Narrow presentation edit'
              : 'Bounded feature or investigation',
    warnings:
      selected !== mode
        ? [`User override ${selected}; recommendation ${mode}. Preserve risk-appropriate checks.`]
        : [],
    capabilities: [
      ...(/\b(ui|interface|css|layout|frontend|button)\b/i.test(request)
        ? ['design', 'browser-qa']
        : []),
      ...(/\b(fail|bug|debug)\b/i.test(request) ? ['debugging'] : []),
      ...(security ? ['security-review'] : []),
      ...(release ? ['release'] : []),
    ],
    advisory: true,
  };
}
