param([string]$Ip = "104.21.43.41", [string]$Host2 = "www.ai-education.net")
$ErrorActionPreference = 'Stop'
$targets = @(
  @{ p = '/';                                              expect = 'MyDNA Explainer' },
  @{ p = '/translate';                                     expect = 'translate' },
  @{ p = '/lookup';                                        expect = 'lookup' },
  @{ p = '/disclaimer';                                    expect = 'educational' },
  @{ p = '/privacy';                                       expect = 'privacy' },
  @{ p = '/kb/explainers/clinvar-classifications';         expect = 'ClinVar' },
  @{ p = '/kb/explainers/vus-explained';                   expect = 'variant of uncertain' },
  @{ p = '/kb/explainers/dtc-testing-limitations';         expect = 'Direct-to-consumer' },
  @{ p = '/kb/explainers/what-genetic-tests-cannot-tell-you'; expect = 'cannot' },
  @{ p = '/kb/templates/questions-for-clinician';          expect = 'clinician' },
  @{ p = '/kb/templates/next-steps-checklist';             expect = 'checklist' },
  @{ p = '/nonexistent-page-xyz';                          expect = $null; want404 = $true }
)
$fail = 0
foreach ($t in $targets) {
  $out = (& curl.exe -s --resolve "${Host2}:443:$Ip" -w "`n__CODE__%{http_code}" "https://$Host2$($t.p)" 2>$null) -join "`n"
  $i = $out.LastIndexOf("__CODE__")
  $code = $out.Substring($i + 8).Trim()
  $body = $out.Substring(0, $i)
  $leaks = @('sk-deepseek','LLM_API_KEY','NCBI_API_KEY','Bearer ') | Where-Object { $body -like "*$_*" }
  $expectNote = if ($t.want404) { if ($code -eq '404') { '404=designed' } else { 'SHOULD-BE-404'; $fail++ } } elseif ($t.expect) { if ($code -eq '200' -and $body -match [regex]::Escape($t.expect)) { 'content=OK' } else { 'content=MISSING'; $fail++ } } else { 'nocontent-check' }
  if ($leaks) { $fail++ }
  "{0,-50} code={1} len={2,7} {3} leaks={4}" -f $t.p, $code, $body.Length, $expectNote, ($(if($leaks){$leaks -join ','}else{'none'}))
}
# sitemap
$sm = & curl.exe -s --resolve "${Host2}:443:$Ip" "https://$Host2/sitemap.xml" 2>$null
$locs = ([regex]::Matches($sm, '<loc>')).Count
$allWww = ([regex]::Matches($sm, 'https://www\.ai-education\.net/')).Count -eq $locs -and $locs -gt 0
"sitemap.xml locs=$locs allWww=$allWww"
if ($locs -lt 10 -or -not $allWww) { $fail++ }
# robots
$rb = & curl.exe -s --resolve "${Host2}:443:$Ip" "https://$Host2/robots.txt" 2>$null
"robots.txt = " + ($rb -replace "`r?`n", ' | ')
# POST prebuilt translate
$post = (& curl.exe -s --resolve "${Host2}:443:$Ip" -X POST -H 'Content-Type: application/json' -d '{"text":"What does BRCA1 positive mean?"}' -w "`n__CODE__%{http_code}" "https://$Host2/api/translate" 2>$null) -join "`n"
$pi = $post.LastIndexOf("__CODE__"); $pcode = $post.Substring($pi + 8).Trim(); $pbody = $post.Substring(0, $pi)
$pj = $pbody | ConvertFrom-Json
"POST /api/translate code=$pcode keys=$(($pj.PSObject.Properties.Name | Select-Object -First 5) -join ',')"
if ($pcode -ne '200' -or -not $pj.explanation) { if ($pcode -ne '200') { $fail++ } }
# apex redirect behavior
$ap = & curl.exe -s -o NUL -w "%{http_code} redir=%{redirect_url}" --resolve "ai-education.net:443:$Ip" "https://ai-education.net/" 2>$null
"apex / -> $ap"
# static asset
$css = & curl.exe -s -o NUL -w "%{http_code} type=%{content_type}" --resolve "${Host2}:443:$Ip" "https://$Host2/_next/static/css/index.Dk33r81g.css" 2>$null
"static css -> $css"
""
if ($fail -eq 0) { "SMOKE RESULT: ALL PASS" } else { "SMOKE RESULT: $fail FAILURES" }
