import React, { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { UploadCloud, CheckCircle2, AlertTriangle, KeyRound, Copy, Download, Upload, Loader2, ExternalLink } from 'lucide-react';
import { getToken, setToken, checkToken, latestDeployRun, OWNER, REPO } from '../../utils/github';

const monthLabel = (k) => format(parseISO(k + '-01'), 'MMM yyyy');

const PublishPanel = ({
  selectedMonth,
  dirtyMonths,
  availableMonths,
  onPublish,
  onCopyMonth,
  currentHasItems,
  onExportData,
  onImportData,
}) => {
  const [token, setTokenState] = useState(getToken());
  const [tokenInput, setTokenInput] = useState('');
  const [showSetup, setShowSetup] = useState(!getToken());
  const [status, setStatus] = useState(null); // {kind: busy|ok|error, text}
  const [deploy, setDeploy] = useState(null);
  const [copyFrom, setCopyFrom] = useState('');

  // After publishing, watch the site rebuild so it's clear when students can see it.
  useEffect(() => {
    if (!deploy || deploy.done) return undefined;
    const t = setInterval(async () => {
      try {
        if (Date.now() - deploy.started > 4 * 60 * 1000) {
          setDeploy({ done: true, ok: true });
          return;
        }
        const run = await latestDeployRun();
        if (!run || new Date(run.created_at).getTime() < deploy.started - 15000) return;
        if (run.status === 'completed') {
          setDeploy({ done: true, ok: run.conclusion === 'success' });
        }
      } catch { /* ignore */ }
    }, 10000);
    return () => clearInterval(t);
  }, [deploy]);

  const saveToken = async () => {
    setToken(tokenInput);
    setStatus({ kind: 'busy', text: 'Checking the token…' });
    try {
      await checkToken();
      setTokenState(tokenInput.trim());
      setTokenInput('');
      setShowSetup(false);
      setStatus({ kind: 'ok', text: 'Connected! Reload the editor to load the newest board from GitHub.' });
    } catch (e) {
      setToken('');
      setTokenState('');
      setStatus({ kind: 'error', text: `That token didn't work: ${e.message}` });
    }
  };

  const publish = async () => {
    setStatus({ kind: 'busy', text: 'Publishing…' });
    try {
      await onPublish((text) => setStatus({ kind: 'busy', text }));
      setStatus({ kind: 'ok', text: 'Published! The website updates in about 1–2 minutes.' });
      setDeploy({ done: false, started: Date.now() });
    } catch (e) {
      setStatus({ kind: 'error', text: `Publishing failed: ${e.message}` });
    }
  };

  const doCopy = async () => {
    if (!copyFrom) return;
    if (currentHasItems && !window.confirm(`Replace everything on the ${monthLabel(selectedMonth)} board with a copy of ${monthLabel(copyFrom)}?`)) return;
    await onCopyMonth(copyFrom);
    setStatus({ kind: 'ok', text: `Copied ${monthLabel(copyFrom)}. Countdowns and calendar dates moved to ${monthLabel(selectedMonth)} — check holidays that change date each year.` });
  };

  const handleFileImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try { onImportData(JSON.parse(e.target.result)); } catch { setStatus({ kind: 'error', text: 'Invalid JSON file' }); }
    };
    reader.readAsText(file);
  };

  const copyChoices = availableMonths.filter((m) => m !== selectedMonth);

  return (
    <div className="mb-8 space-y-3">
      {/* Publish */}
      <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Website</h3>

        {token && !showSetup ? (
          <>
            <button
              onClick={publish}
              disabled={!dirtyMonths.length || status?.kind === 'busy'}
              className="w-full flex items-center justify-center gap-2 bg-green-600 disabled:bg-gray-300 text-white px-4 py-3 rounded-xl hover:bg-green-700 shadow-md text-sm font-bold"
            >
              {status?.kind === 'busy' ? <Loader2 size={18} className="animate-spin" /> : <UploadCloud size={18} />}
              {dirtyMonths.length
                ? `Publish ${dirtyMonths.map(monthLabel).join(', ')}`
                : 'Everything is published'}
            </button>
            {dirtyMonths.length > 0 && (
              <p className="text-xs text-amber-700 mt-2">You have unpublished changes.</p>
            )}
            {deploy && (
              <p className="text-xs mt-2 flex items-center gap-1">
                {!deploy.done && <><Loader2 size={12} className="animate-spin" /> Website is updating…</>}
                {deploy.done && deploy.ok && <><CheckCircle2 size={12} className="text-green-600" /> Live for students now.</>}
                {deploy.done && !deploy.ok && <><AlertTriangle size={12} className="text-red-600" /> The website build failed — check GitHub Actions.</>}
              </p>
            )}
            <button onClick={() => setShowSetup(true)} className="text-[11px] text-gray-400 hover:text-gray-600 mt-2 flex items-center gap-1">
              <KeyRound size={11} /> GitHub token settings
            </button>
          </>
        ) : (
          <div className="space-y-2 text-xs text-gray-600">
            <p className="font-semibold text-gray-800">Connect to GitHub (once per computer)</p>
            <ol className="list-decimal ml-4 space-y-1">
              <li>
                Open{' '}
                <a className="text-blue-600 underline inline-flex items-center gap-0.5" href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noreferrer">
                  GitHub → new fine-grained token <ExternalLink size={10} />
                </a>
              </li>
              <li>Repository access: <b>Only select repositories</b> → <b>{OWNER}/{REPO}</b></li>
              <li>Permissions → Repository → <b>Contents: Read and write</b> (and <b>Actions: Read</b> to see when the site is live)</li>
              <li>Generate, copy and paste it here:</li>
            </ol>
            <input
              type="password"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="github_pat_…"
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
            />
            <div className="flex gap-2">
              <button onClick={saveToken} disabled={!tokenInput.trim()} className="flex-1 bg-gray-900 disabled:bg-gray-300 text-white px-3 py-2 rounded-lg text-sm font-semibold">
                Save token
              </button>
              {token && (
                <>
                  <button onClick={() => setShowSetup(false)} className="px-3 py-2 rounded-lg text-sm bg-gray-100">Cancel</button>
                  <button
                    onClick={() => { setToken(''); setTokenState(''); }}
                    className="px-3 py-2 rounded-lg text-sm bg-red-50 text-red-600"
                  >
                    Remove
                  </button>
                </>
              )}
            </div>
            <p className="text-[11px] text-gray-400">The token stays in this browser only.</p>
          </div>
        )}

        {status && (
          <div
            className={`mt-3 text-xs rounded-lg px-3 py-2 ${
              status.kind === 'error' ? 'bg-red-50 text-red-700' : status.kind === 'ok' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'
            }`}
          >
            {status.text}
          </div>
        )}
      </div>

      {/* Copy a month */}
      {copyChoices.length > 0 && (
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Start from another month</h3>
          <div className="flex gap-2">
            <select value={copyFrom} onChange={(e) => setCopyFrom(e.target.value)} className="flex-1 px-2 py-2 bg-white border border-gray-200 rounded-lg text-sm">
              <option value="">Choose a month…</option>
              {copyChoices.map((m) => (
                <option key={m} value={m}>{monthLabel(m)}</option>
              ))}
            </select>
            <button onClick={doCopy} disabled={!copyFrom} className="px-3 py-2 bg-white border border-gray-200 rounded-lg disabled:opacity-40" title={`Copy into ${monthLabel(selectedMonth)}`}>
              <Copy size={16} />
            </button>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Copies everything into {monthLabel(selectedMonth)}.</p>
        </div>
      )}

      {/* Backup */}
      <div className="flex gap-2 text-xs">
        <label className="flex-1 cursor-pointer flex items-center justify-center gap-1 bg-white border border-gray-200 rounded-lg py-1.5 text-gray-500 hover:bg-gray-50">
          <input type="file" accept=".json" onChange={handleFileImport} className="hidden" />
          <Upload size={12} /> Import backup
        </label>
        <button onClick={onExportData} className="flex-1 flex items-center justify-center gap-1 bg-white border border-gray-200 rounded-lg py-1.5 text-gray-500 hover:bg-gray-50">
          <Download size={12} /> Download backup
        </button>
      </div>
    </div>
  );
};

export default PublishPanel;
