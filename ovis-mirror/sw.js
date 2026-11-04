// Service worker for Ovis. Policy: navigations are network-first (so a
// fresh build always wins when online) falling back to the cached shell when
// offline; static assets (hashed bundles, icons, favicons) are cache-first since
// they are content-addressed or rarely change. The web manifest is not: its URL
// never changes and the browser rereads it to update the installed app, so a
// cached copy would pin every install to its first manifest. API and websocket
// traffic is never intercepted so live workspace data is always fresh.
// Nothing is precached. The typefaces are /assets/ files too (src/fonts/fonts.css): Pretendard
// comes as 92 chunks split by unicode-range and the browser asks only for those whose characters
// a page draws, so each is cached as it is first fetched and a phone that has shown Korean once
// draws it offline. Never list them for install: that would download all 3 MB on every device.
// A new cache starts empty for the same reason, so the cache of the name before it is kept
// until this one holds a shell and the files it starts with: the page that brought this worker
// was loaded through the old one, and its shell, bundles and font chunks are all there. Deleted
// at activation, the first reload without a network would find no shell at all. Only the new
// build's files (BUILD_FILES), the retired shell's entry files, typefaces and icons are copied
// across, so no other bundle of an old build outlives the first navigation that reaches the server.
// Every build is a worker of its own: the build stamps BUILD into dist/sw.js
// (scripts/service-worker-build.ts), so its cache is named after it and the last build's
// bundles go with the last build's cache. CACHE_NAME is the part a person moves.
// The typefaces and icons are not a build's: a font chunk's name changes only with its contents,
// and most are the same file release after release. They live in FILES, which no build retires,
// so an update does not cost a phone the glyphs it had drawn offline.
// BUILD_FILES, stamped beside BUILD, names the build's own /assets/ files (names only, no typefaces).
// A file of this build that the worker before kept (the reload after an update is still answered
// by it, KaTeX or Mermaid fetched early among them) is moved into this cache when that one is
// retired, and a file of another build is not copied forward. A worker no build stamped has no
// list: any file is copied forward, as before.
// A retired cache's own shell keeps its entry script and stylesheet here too: a page that started
// from that shell offline and has not asked for them yet still boots, then offers a reload.
const CACHE_NAME = "ovis-v4-sheep";
const BUILD = "d526de15fef4";
const BUILD_FILES = ["/assets/ChatTimeline-BiGUQd8J.js","/assets/DiffWorkerPool-DxNzqwRq.js","/assets/RepoDiff-BGbSY1JV.js","/assets/RepoDiff-BhUCR8i0.css","/assets/VirtualSource-Dt4mRvKw.js","/assets/VirtualSource-DuBrff0V.css","/assets/abap-CLvhMVsD.js","/assets/abnfDiagram-YUKMZFIV-BboXxFbb.js","/assets/actionscript-3-Cs6JJXT5.js","/assets/ada-X3Y2mlq2.js","/assets/ahk-DwADkxyd.js","/assets/ahk2-_6rzW9BS.js","/assets/andromeeda-vGVdxbeo.js","/assets/angular-html-C4LeXCe-.js","/assets/angular-ts-CRxW7p1W.js","/assets/apache-U0d_L8uA.js","/assets/apex-KFGFyKwG.js","/assets/apl-D60kkz--.js","/assets/applescript-CCn79oCD.js","/assets/ara-4CJ0cIlV.js","/assets/arc-C7ZjdJXO.js","/assets/architecture-WOLXFQ4H-CV2UCNQ7.js","/assets/architectureDiagram-47P4ROYG-qLDO-GJ0.js","/assets/array-BifhSqXX.js","/assets/asciidoc-SCjQUq34.js","/assets/asm-Cmm7eHzH.js","/assets/astro-3Zgg9XqN.js","/assets/aurora-x-CDeNXAV0.js","/assets/awk-BWXHIvNe.js","/assets/ayu-dark-DluEY0Gj.js","/assets/ayu-light-C3h-C4tm.js","/assets/ayu-mirage-Bqwy1Gya.js","/assets/ballerina-B7ZEbQpA.js","/assets/bat-qdxAdBWQ.js","/assets/beancount-C2IN4Vk8.js","/assets/berry-DKpUyyne.js","/assets/bibtex-Ci_nEsc7.js","/assets/bicep-CUHmPFLl.js","/assets/bird2-CYIUgYqB.js","/assets/blade-B5YUZNEG.js","/assets/blockDiagram-E7TT5TSB-zRUxijHm.js","/assets/bsl-_VjlB9mv.js","/assets/c-BNQJhXlP.js","/assets/c3-D0apG41V.js","/assets/c4Diagram-CRA5TL53-DtFsxdwF.js","/assets/cadence-CQ2zXKGN.js","/assets/cairo-DLTphjLi.js","/assets/catppuccin-frappe-C9Q5zVZY.js","/assets/catppuccin-latte-CtsyrtPq.js","/assets/catppuccin-macchiato-R8nAf1vR.js","/assets/catppuccin-mocha-DjuaAJKi.js","/assets/channel-Bk8NR_u_.js","/assets/channel-DErlFDH9.js","/assets/chapel-CFMD-Djs.js","/assets/chunk-2BW5OAIV-DmZ3Ihts.js","/assets/chunk-2Q5K7J3B-DkgXkOxL.js","/assets/chunk-3YJQHVM4-fgoQwqJ9.js","/assets/chunk-4EA7E6EY-Dywr9u1G.js","/assets/chunk-5VM5RSS4-ZNzvKenW.js","/assets/chunk-7TKQ45FW-Me76yw9v.js","/assets/chunk-AW2ZBBNX-DgtUpOIQ.js","/assets/chunk-DBDB3WZW-Cy0Md6xw.js","/assets/chunk-DUW6YSOI-7XAGGoqR.js","/assets/chunk-E2ZNV5FY-CbOVHD4X.js","/assets/chunk-EU5HNXII-L1SEtSh7.js","/assets/chunk-FVRAUYC3-CE3HkcZq.js","/assets/chunk-HJ2JQQFS-NKYDAJEj.js","/assets/chunk-HTAEGDNF-BMwypRJ1.js","/assets/chunk-J5ZVWO5B-oDCd-gWO.js","/assets/chunk-JWPE2WC7-CEzeTtJC.js","/assets/chunk-KQW6MTUR-DIlginaY.js","/assets/chunk-NGNAAXSQ-BQTmN_HD.js","/assets/chunk-NTY3LDVX-DZLQg19W.js","/assets/chunk-VPRB5NB3-BjmWc9pJ.js","/assets/chunk-XC4XBNZT-DO7uw6az.js","/assets/chunk-XXDRQBXY-BOdnkzdb.js","/assets/chunk-Y2CYZVJY-DsF7k-Jl.js","/assets/clarity-CtfBBspg.js","/assets/classDiagram-v2-K4WV4PDN-ALM2rIiO.js","/assets/clojure-DqKBuwfJ.js","/assets/cmake-Bj61d0ZC.js","/assets/cobol-DY6IFdmX.js","/assets/codeowners-C8r90Shi.js","/assets/codeql-oeQT6MSM.js","/assets/coffee-BP03ytLP.js","/assets/common-lisp-Cv5bFMCO.js","/assets/coq-CGaSfhwR.js","/assets/cose-bilkent-JH36ORCC-DBZ2m4AG.js","/assets/cpp-CUBNVKxn.js","/assets/crystal-Dlq5HHIe.js","/assets/csharp-dmMxLVLW.js","/assets/css-BiJUKRHp.js","/assets/csv-Dx-8-gkx.js","/assets/cue-CE9AQfxI.js","/assets/cynefin-EF2NZ3EQ-Beg3MxUF.js","/assets/cynefinDiagram-3GCD6N5R-DmRMO0Nn.js","/assets/cypher-ClKdZ_lG.js","/assets/cytoscape.esm-Ch-VPr8X.js","/assets/d-qD-0Kul2.js","/assets/dagre-W4DXFKR2-DBsWnsYm.js","/assets/dark-plus-Cs2F2srj.js","/assets/dart-CHZY9Xhz.js","/assets/dax-BkyTk9wS.js","/assets/defaultLocale-BFoDCU3G.js","/assets/desktop-Dlh5hvp9.js","/assets/diagram-2UJZ2QOL-sFbVEjiV.js","/assets/diagram-OVF4WLC6-BTJeNVya.js","/assets/diagram-PFPMY2P6-0dbAsGjv.js","/assets/diagram-UMYRVEAY-CsTuTHb_.js","/assets/diagram-YEKJPTXX-Bwed_3Cr.js","/assets/diagram-ZIFT7M5P-BoZMUu64.js","/assets/diff-woXpYk--.js","/assets/dist-B_J_HbC0.js","/assets/docker-IyjqRm3v.js","/assets/dotenv-CuH5my32.js","/assets/dracula-BHWKrbxM.js","/assets/dracula-soft-5eyTD99u.js","/assets/dream-maker-DW3nJb8Q.js","/assets/ebnfDiagram-VR2GEFS7-C0HZHctv.js","/assets/edge-DznSXZdq.js","/assets/elixir-D1HcpP2u.js","/assets/elk-IJKZMXRS-CUjdB17X.js","/assets/elm-Bmx6Fs0i.js","/assets/emacs-lisp-DR2vtWaj.js","/assets/erDiagram-O2IAPWRE-DYZvrhgV.js","/assets/erb-DwsUspej.js","/assets/erlang-Cphh6RMH.js","/assets/eventmodeling-K75KTNOO-BoZF45us.js","/assets/everforest-dark-sB-x3p7T.js","/assets/everforest-light-Df2xbC6M.js","/assets/fennel-DQxkIbk2.js","/assets/fish-BJitypiv.js","/assets/flowDiagram-OXPTDLAJ-DIKiznTi.js","/assets/fluent-C03EYrpw.js","/assets/fortran-fixed-form-DEKoE2YW.js","/assets/fortran-free-form-CYNrtFtB.js","/assets/fsharp-D13ZGOAj.js","/assets/ganttDiagram-R7TSEDQI-B4Djyfr2.js","/assets/gdresource-xMC7jr7x.js","/assets/gdscript-DYvRD3hg.js","/assets/gdshader-CBce3t8t.js","/assets/genie-CV2tkWYe.js","/assets/gherkin-DExj1W_8.js","/assets/git-commit-BSykSTBG.js","/assets/git-rebase-C-RR1FSc.js","/assets/gitGraph-VSP46ZUC-D6sM47_7.js","/assets/gitGraphDiagram-XJZIOB7I-D5aPA814.js","/assets/github-dark-C-LZuMrd.js","/assets/github-dark-default-DXG-b-1a.js","/assets/github-dark-dimmed-Bx1FflLF.js","/assets/github-dark-high-contrast-B_tTalzw.js","/assets/github-light-EUqPIrTm.js","/assets/github-light-default-BXViO-2h.js","/assets/github-light-high-contrast-B68TUdTA.js","/assets/gleam-CSRkHgEL.js","/assets/glimmer-js-BUse42ki.js","/assets/glimmer-ts-zH_nSjyx.js","/assets/glsl-CyFpZtQv.js","/assets/gn-CAXYAgV-.js","/assets/gnuplot-7GGW24-e.js","/assets/go-rLFTqkRN.js","/assets/graphlib-DeFaxIdj.js","/assets/graphql-BIyAKkG2.js","/assets/groovy-CacY0gHj.js","/assets/gruvbox-dark-hard-C820rvS2.js","/assets/gruvbox-dark-medium-BPjhmG05.js","/assets/gruvbox-dark-soft-MrdJrrXF.js","/assets/gruvbox-light-hard-BC_s9l72.js","/assets/gruvbox-light-medium-BAWPOn9u.js","/assets/gruvbox-light-soft-BSMLrYjP.js","/assets/hack-qk6BiceN.js","/assets/haml-BkBm6IgF.js","/assets/handlebars-FMeV8O-Z.js","/assets/haskell-D8IpX4py.js","/assets/haxe-C8oCnwJJ.js","/assets/hcl-Dh228itO.js","/assets/highlight.worker-CeUCnjyL.js","/assets/hjson-CxZEssPk.js","/assets/hlsl-Cvrh5tZx.js","/assets/horizon-CE9ld1lL.js","/assets/horizon-bright-DSNQnXHK.js","/assets/houston-CsvMBhTu.js","/assets/html-CvoVzlT3.js","/assets/html-derivative-CmO0_REm.js","/assets/http-c4_vT9ST.js","/assets/hurl-BqZA9I9Q.js","/assets/hxml-Dcm88srW.js","/assets/hy-CZbG8q4J.js","/assets/imba-DsUTQ-LC.js","/assets/index-CLHzhS1T.css","/assets/index-CixB0mih.js","/assets/info-OHQRW6UA-BfeA0I92.js","/assets/infoDiagram-5W2HQ5XZ-2-uv1WF_.js","/assets/ini-B5eOa1yu.js","/assets/init-C-OQMol4.js","/assets/ishikawaDiagram-K3B6WC7H-DkdFGDnI.js","/assets/java-D7h0NA_A.js","/assets/javascript-DcMHgNcu.js","/assets/jinja-IxhZJXij.js","/assets/jison-Ru_S5AEn.js","/assets/journeyDiagram-COXZFDF6-BItXW4Aq.js","/assets/json-DePJdKYk.js","/assets/json5-BR5RXkoi.js","/assets/jsonc-CYpm1nAK.js","/assets/jsonl-CmCQp5Yx.js","/assets/jsonnet-CJTPZ8u_.js","/assets/jssm-DXw9l8Rf.js","/assets/jsx-BUUYi3qs.js","/assets/jsx-runtime-DKj5X9O4.js","/assets/julia-BuaSHoYZ.js","/assets/just-CdScSDMR.js","/assets/kanagawa-dragon-Bozd7klA.js","/assets/kanagawa-lotus-BmuOG9ZW.js","/assets/kanagawa-wave-BML5mF2J.js","/assets/kanban-definition-P3RFRI5V-CpBanq8b.js","/assets/katex-BkW8oxaT.css","/assets/katex-Bv0pbRIe.js","/assets/katex-Cydy9XKa.js","/assets/kdl-CsD5j6eV.js","/assets/kotlin-DhhofPvG.js","/assets/kusto-C7mF5XQf.js","/assets/laserwave-C_8bwKvT.js","/assets/latex-B6yY1rfM.js","/assets/lean-CewbzKMR.js","/assets/less-DVTAwKKz.js","/assets/light-plus-DVQuIRkW.js","/assets/line-Cg5_y5Z-.js","/assets/linear-C_pARy1i.js","/assets/liquid-DNgNMjPq.js","/assets/llvm-DqHOMS-s.js","/assets/log-BNLmms1o.js","/assets/logo-Cluzi2Zq.js","/assets/lua-Z49wBRLR.js","/assets/luau-VGWVLoqX.js","/assets/make-Dixweg8N.js","/assets/markdown-BYOwaDjH.js","/assets/markdownPreview.worker-Cqq3V0kj.js","/assets/marko-i5cBncq8.js","/assets/material-theme-Bm3Qr25_.js","/assets/material-theme-darker-2IIEA8gg.js","/assets/material-theme-lighter-uhdI0v04.js","/assets/material-theme-ocean-CHQ94UKr.js","/assets/material-theme-palenight-B5W6OYN7.js","/assets/matlab-D7qyCx1q.js","/assets/mdc-C3wRYKz5.js","/assets/mdx-DQZ5AkYe.js","/assets/mermaid-BxpfTIzt.js","/assets/mermaid-BzRllu3p.js","/assets/mermaid-parser.core-DIlifDwc.js","/assets/min-dark-BSWPekZh.js","/assets/min-light-DDpmG2fV.js","/assets/mindmap-definition-LZFPQGKD-DGGGgBqU.js","/assets/mipsasm-BMqwQI7S.js","/assets/mojo-fg40_ntQ.js","/assets/monokai-BscAjiQZ.js","/assets/moonbit-D9W784E_.js","/assets/move-BYnGhZoM.js","/assets/narrat-_X_XdTYD.js","/assets/nextflow-CSgcYZcx.js","/assets/nextflow-groovy-D7IRt6Pp.js","/assets/nginx-BrbrEdla.js","/assets/night-owl-DhmEMT88.js","/assets/night-owl-light-eJ-hLW7d.js","/assets/nim-BCe7ZKXY.js","/assets/nix-IvuFDN5E.js","/assets/nord-Cb4Vim4T.js","/assets/nsis-CjNLYCLg.js","/assets/nushell--0fT3PI1.js","/assets/objective-c-D1A_Heim.js","/assets/objective-cpp-BsSzOQcm.js","/assets/ocaml-O90oeIOV.js","/assets/odin-B1RWQWA5.js","/assets/one-dark-pro-C6YyR8OD.js","/assets/one-light-D7Lr4KcI.js","/assets/openscad-BUDT5pXO.js","/assets/ordinal-BDEzSJ7C.js","/assets/org-DRea7jx9.js","/assets/packet-JDAUHWVQ-Dmsnf6RS.js","/assets/pascal-4ZHwLPI5.js","/assets/path-fybaL0A-.js","/assets/pegDiagram-BGZESJAR-CMgrTPVH.js","/assets/perl-DLhC7S_Q.js","/assets/php-CDzTReqR.js","/assets/pie-XZMESJXO-BVdqnQUJ.js","/assets/pieDiagram-CAPJLFHJ-QLBhzRGX.js","/assets/pierre-dark-CpLgRqie.js","/assets/pierre-dark-protanopia-deuteranopia-B35FxJx-.js","/assets/pierre-dark-soft-kZQmAZld.js","/assets/pierre-dark-tritanopia-CpjhbsIL.js","/assets/pierre-dark-vibrant-CpQYzh95.js","/assets/pierre-light-CoaEpmwp.js","/assets/pierre-light-protanopia-deuteranopia-0fSaH845.js","/assets/pierre-light-soft-lWLdNTOI.js","/assets/pierre-light-tritanopia-CEbqgOJL.js","/assets/pierre-light-vibrant-D80Fkn33.js","/assets/pkl-ot-7Btpt.js","/assets/plastic-DQwYfKfQ.js","/assets/plsql-DGHpHOYJ.js","/assets/po-BiJDBrnU.js","/assets/poimandres-DRFjx7u4.js","/assets/polar-C7UOKdEL.js","/assets/postcss-BXeXVLqQ.js","/assets/powerquery-DNMTfnFr.js","/assets/powershell-QtSnmXcu.js","/assets/prisma-DMgNhnYS.js","/assets/prolog-iXnhIJG7.js","/assets/proto-DB4EqR-F.js","/assets/pug-COoI2o4U.js","/assets/puppet-CDv2pdJW.js","/assets/purescript-9MfHhQsQ.js","/assets/python-gzcpVVnB.js","/assets/qml-g4UDed-8.js","/assets/qmldir-DCQb3MpD.js","/assets/qss-Fe1Jh2GI.js","/assets/quadrantDiagram-GDMTTRAM-LyEhz2QH.js","/assets/r-CvCSiWB_.js","/assets/racket-DcIDlBhZ.js","/assets/radar-ABXABTNO-CYoewOyZ.js","/assets/railroad-I3PHUGI6-HSTQlEAD.js","/assets/railroad-abnf-LNEFI6M7--L39w6K2.js","/assets/railroad-ebnf-DWYD2UWJ-CwvxfsAI.js","/assets/railroad-peg-JR7BVNR7-BoVf-Kux.js","/assets/railroadDiagram-SM67HX2B-C2WdUc7G.js","/assets/raku-B3gFvitq.js","/assets/razor-BRLDaw7i.js","/assets/rbs-C0MpOrj4.js","/assets/red-CYlAq2b0.js","/assets/reg-CRGYupPL.js","/assets/regexp-I2jnduhj.js","/assets/rel-BtDbiS_P.js","/assets/requirementDiagram-X7JNWC4A-gzx8mssb.js","/assets/riscv-Ckw8ddFX.js","/assets/rolldown-runtime-Dd_uD5pT.js","/assets/ron-VUp2lXgN.js","/assets/rose-pine-aMsaMD1D.js","/assets/rose-pine-dawn-8PwUyIlP.js","/assets/rose-pine-moon-DO-qXg-I.js","/assets/rosmsg-CAekHB0j.js","/assets/rough.esm-BdPdU-VR.js","/assets/rst-C_NC39V7.js","/assets/ruby-CAlqWX7Z.js","/assets/rust-DpiIf5JO.js","/assets/sankeyDiagram-UM26HJRW-OjOSx8UF.js","/assets/sas-Cr47JhdL.js","/assets/sass-DXrisJhu.js","/assets/scala-BiFt_7mu.js","/assets/scheme-DQCgrYNe.js","/assets/scss-BuNb6cgZ.js","/assets/sdbl-bTVj8UrX.js","/assets/sequenceDiagram-ZO4K6R2Y-DMFVhhD4.js","/assets/shaderlab-TOUzSsQk.js","/assets/shell-BsM-Ty6p.css","/assets/shell-GivwTPWQ.js","/assets/shellscript-B51zB43X.js","/assets/shellsession-B-KBpmJs.js","/assets/sizeCapture-INFHLROL-DUPUJe6W.js","/assets/slack-dark-DnToyrRv.js","/assets/slack-ochin-B2OO5cIa.js","/assets/smalltalk-BHpQb5nM.js","/assets/smithy-Dgaz7aur.js","/assets/snazzy-light-4G7pJPwS.js","/assets/solarized-dark-b97czJOk.js","/assets/solarized-light-DFPxpIYQ.js","/assets/solidity-Bj7E1mRn.js","/assets/soy-B-X4e_cm.js","/assets/sparql-D_iOobhT.js","/assets/splunk-BC2Px7Mm.js","/assets/sql-CrePkbX5.js","/assets/src-DRJt42hk.js","/assets/ssh-config-BgfXC-Er.js","/assets/stata-LQMPNdRb.js","/assets/stateDiagram-v2-TBUQTH76-BN88qSR8.js","/assets/stylus-B6D30XZt.js","/assets/surrealql-DalIYx4r.js","/assets/svelte-CutSaB0m.js","/assets/swift-CyEgAFGc.js","/assets/swimlanes-N4OXWK64-VdUdptNH.js","/assets/swimlanesDiagram-K3J5GTZL-BXo2jRMy.js","/assets/synthwave-84-nFMaYfgc.js","/assets/system-verilog-Dh5ihWbf.js","/assets/systemd-BxMlprV5.js","/assets/talonscript-CohzipZa.js","/assets/tasl-DMoTqEGO.js","/assets/tcl-CZd0xW_V.js","/assets/templ-STIZV9cS.js","/assets/terraform-DswuEJGm.js","/assets/tex-JPaUWOrn.js","/assets/theme-bootstrap-f1c4fae877.js","/assets/timeline-definition-YOQAKGHF-BT1aeqPb.js","/assets/tokyo-night-oM2G3aXe.js","/assets/toml-CcmNWLt0.js","/assets/treeView-D4JQ5SDB-hr_uKuEt.js","/assets/treemap-SAJKECNS-DOD9pyEd.js","/assets/ts-tags-DugY2c1f.js","/assets/tsv-sltzmVWM.js","/assets/tsx-DvWhG4dC.js","/assets/turtle-ByJddavk.js","/assets/twig-Bh3eB6xs.js","/assets/typescript-BTGs5etX.js","/assets/typespec-BGhR2SqG.js","/assets/typst-CjOTVLit.js","/assets/usecaseDiagram-VIAY4XPW-wg1eGCaU.js","/assets/v-DBj4K9d_.js","/assets/vala-zf12oZj6.js","/assets/vb-DOwzaHZ0.js","/assets/vennDiagram-BLWOH2XV-D3c_W5Lz.js","/assets/verilog-B2gwz-sJ.js","/assets/vesper-DdrHHSXu.js","/assets/vhdl-BroJfC0k.js","/assets/viml-DvXPmvsu.js","/assets/vitesse-black-fwtXNY1n.js","/assets/vitesse-dark-BZCL-v6S.js","/assets/vitesse-light-VbXTXTou.js","/assets/vue-Bu9nv_eN.js","/assets/vue-html-BXjKVtKk.js","/assets/vue-vine-Ci2qndh_.js","/assets/vyper-CgoNMtux.js","/assets/wardley-7MLQ67FV-BVD5qZpx.js","/assets/wardleyDiagram-YMQ3BMBF-BsskMag8.js","/assets/wasm-BnjxR4X6.js","/assets/wasm-ByWQv1Qj.js","/assets/wenyan-C8pVoKbM.js","/assets/wgsl-BsKzXJz4.js","/assets/wikitext-ClFFjSW2.js","/assets/wit-DdvCle-K.js","/assets/wolfram-DLL8P-h_.js","/assets/worker-BbztyX79.js","/assets/xml-C01ajBW7.js","/assets/xsl-CCLNyvR3.js","/assets/xychartDiagram-TAQBALBS-mcMc-gjn.js","/assets/yaml-BWCS3NLV.js","/assets/zenscript-BnlCZFoB.js","/assets/zig-CMLA9XwU.js"];
const CACHE = BUILD ? `${CACHE_NAME}-${BUILD}` : CACHE_NAME;
const FILES = "ovis-files-v1";
const buildFiles = BUILD_FILES ? new Set(BUILD_FILES) : null;

/** Whether `pathname` is a file this build uses; any file, for a worker no build stamped. */
function ofThisBuild(pathname) {
  return !buildFiles || buildFiles.has(pathname);
}

const CACHE_FIRST_PATHS = new Set([
  "/favicon.png",
  "/favicon.ico",
  "/apple-touch-icon.png",
]);

function isCacheFirst(pathname) {
  if (pathname.startsWith("/assets/") || pathname.startsWith("/icons/")) return true;
  return CACHE_FIRST_PATHS.has(pathname);
}

/** A typeface or an icon: kept in FILES across builds. */
function isLongLived(pathname) {
  if (pathname.startsWith("/icons/") || CACHE_FIRST_PATHS.has(pathname)) return true;
  return pathname.startsWith("/assets/") && /\.(woff2?|ttf)$/.test(pathname);
}

/** A page where a file was asked for: a server that had no such file answered with its shell. */
function isPage(response) {
  return (response.headers.get("content-type") || "").startsWith("text/html");
}

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // no cache is deleted here: see CACHE_NAME, BUILD and keepShell
  event.waitUntil(self.clients.claim());
});

/** The files a shell cannot start without: its entry script and its stylesheet. */
function shellFiles(html) {
  const files = new Set();
  for (const [, path] of html.matchAll(/<(?:script|link)\b[^>]*?\s(?:src|href)="(\/assets\/[^"?#]+\.(?:js|css))"/g)) files.add(path);
  return [...files];
}

/** A file from a cache of another name, else from the network; null when neither has it. */
async function fileFor(path) {
  const older = await caches.match(path);
  if (older && !isPage(older)) return older;
  try {
    const response = await fetch(path);
    return response.ok && response.type === "basic" && !isPage(response) ? response : null;
  } catch (err) {
    return null;
  }
}

/**
 * The shell just fetched becomes this cache's "/" once the cache holds every file that shell
 * starts with: the worker before may have answered them, and a network that drops before the
 * page asks again must not leave a shell without them. Until then the old caches and their
 * shell stay, a complete start offline. Then the caches of other names go, their typefaces and
 * icons moved to FILES first.
 */
async function keepShell(response) {
  const html = await response.clone().text();
  const cache = await caches.open(CACHE);
  for (const path of shellFiles(html)) {
    if (await cache.match(path)) continue;
    const file = await fileFor(path);
    if (!file) return;
    await cache.put(path, file);
  }
  await cache.put("/", response);
  const files = await caches.open(FILES);
  const names = (await caches.keys()).filter((name) => name !== CACHE && name !== FILES);
  for (const name of names) {
    const old = await caches.open(name);
    // the files the retired cache's shell starts with: a page given that shell may not have asked yet
    const oldShell = await old.match("/");
    const starts = new Set(oldShell ? shellFiles(await oldShell.text()) : []);
    for (const request of await old.keys()) {
      const path = new URL(request.url).pathname;
      const into = isLongLived(path) ? files
        : starts.has(path) || (buildFiles && buildFiles.has(path)) ? cache : null;
      if (!into || (await into.match(request))) continue;
      const file = await old.match(request);
      if (file && !isPage(file)) await into.put(request, file);
    }
  }
  await Promise.all(names.map((name) => caches.delete(name)));
}

/** The shell to start from offline: this cache's, else the one a cache not yet deleted holds. */
async function cachedShell() {
  const cache = await caches.open(CACHE);
  return (await cache.match("/")) || (await caches.match("/"));
}

// Only the shell build stamps this contract. Server-served workers keep their fetch behavior.
const RELAY_RESOURCES = null;

if (RELAY_RESOURCES) self.addEventListener("message", (event) => {
  if (event.data?.type === "ovis-relay-resources-v1") event.ports[0]?.postMessage({ type: "ovis-relay-resources-v1" });
});

/** A page of this PC's app: its scope on this origin, not its render host or a file under `~`. */
function ofThisPcApp(url, scope) {
  try {
    const address = new URL(url);
    return address.origin === self.location.origin && address.pathname.startsWith(scope) && !address.pathname.startsWith(`${scope}~`);
  } catch { return false; }
}

/**
 * Whether this PC's own app asked: what a PC's own server gets from its SameSite=Strict cookie,
 * which another site's link or frame never carries. The Sec-Fetch-* headers are added after the
 * worker, so it cannot read them: a navigation (a tab, a frame, a download) counts by the page it
 * came from, and any other request by the page that made it. No referrer (a typed address, or a
 * page that withheld it) is refused too.
 */
async function askedByThisPc(event, scope) {
  if (event.request.mode === "navigate") return ofThisPcApp(event.request.referrer, scope);
  const client = event.clientId ? await self.clients.get(event.clientId) : undefined;
  return client !== undefined && ofThisPcApp(client.url, scope);
}

/** No caching, including errors. Only controlled windows in this PC's registration are eligible. */
async function relayResourceResponse(event, target) {
  const { request } = event;
  const scope = new URL(self.registration.scope).pathname;
  if (!(await askedByThisPc(event, scope))) {
    return new Response("Open this file from Ovis.", { status: 403, headers: { "cache-control": "no-store" } });
  }
  const windows = await self.clients.matchAll({ type: "window" });
  for (const client of windows) {
    const address = new URL(client.url);
    if (address.origin !== self.location.origin || !address.pathname.startsWith(scope)
      || address.pathname.startsWith(`${scope}~`)) continue;
    request.signal.throwIfAborted();
    const answer = await new Promise((resolve, reject) => {
      const channel = new MessageChannel();
      const port = channel.port1;
      let reader;
      const finish = () => {
        clearTimeout(timer);
        request.signal.removeEventListener("abort", aborted);
        port.close();
      };
      const aborted = () => {
        port.postMessage({ type: "abort" });
        if (reader) void reader.cancel(request.signal.reason);
        finish();
        reject(request.signal.reason);
      };
      const timer = setTimeout(() => {
        port.postMessage({ type: "abort" });
        finish();
        resolve(null);
      }, 5000);
      request.signal.addEventListener("abort", aborted, { once: true });
      port.onmessage = (event) => {
        clearTimeout(timer);
        const data = event.data;
        if (!data?.available) { finish(); resolve(null); return; }
        if (data.status === undefined) return; // selected; headers arrive when the PC answers
        const headers = new Headers(data.headers.filter(([name]) => RELAY_RESOURCES.headers.includes(name.toLowerCase())));
        // A paired PC is not trusted with the shell origin shared by every other PC.
        // PDF uses Chrome's isolated viewer, which refuses sandboxed documents. nosniff
        // keeps HTML disguised as PDF out of the HTML parser; script-src also forbids
        // shell-origin script. Rendered HTML runs separately at ~render, not this route.
        const pdf = headers.get("content-type")?.split(";")[0].trim().toLowerCase() === "application/pdf";
        // Only the shell may frame a PC's file, as only the app frames a file of the PC's own server.
        headers.append("content-security-policy", `${pdf ? "" : "sandbox; "}default-src 'none'; script-src 'none'; img-src 'self' data:; media-src 'self'; style-src 'unsafe-inline'; frame-ancestors 'self'`);
        headers.set("x-frame-options", "SAMEORIGIN");
        headers.set("x-content-type-options", "nosniff");
        reader = data.body?.getReader();
        const body = reader ? new ReadableStream({
          async pull(controller) {
            try {
              const next = await reader.read();
              if (next.done) { controller.close(); finish(); }
              else controller.enqueue(next.value);
            } catch (error) { controller.error(error); finish(); }
          },
          async cancel(reason) {
            port.postMessage({ type: "abort" });
            await reader.cancel(reason);
            finish();
          },
        }, { highWaterMark: 0 }) : null;
        resolve(new Response(body, { status: data.status, headers }));
        if (!body) finish();
      };
      client.postMessage({
        type: "ovis-relay-resource", id: crypto.randomUUID(), serverId: scope.split("/")[2],
        target, headers: [...request.headers].filter(([name]) => RELAY_RESOURCES.requestHeaders.includes(name)),
      }, [channel.port2]);
    });
    if (answer) return answer;
  }
  return new Response("Open this PC in Ovis to load its files.", { status: 503, headers: { "cache-control": "no-store" } });
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/") || url.pathname === "/ws") return;

  if (RELAY_RESOURCES) {
    const scope = new URL(self.registration.scope).pathname;
    if (url.pathname === `${scope}~render`) return;
    if (url.pathname.startsWith(`${scope}~`)) {
      const target = url.pathname.slice(scope.length + 1) + url.search;
      if (/^\/s\/[0-9a-f]{32}\/$/.test(scope) && new RegExp(RELAY_RESOURCES.target).test(target)) {
        event.respondWith(relayResourceResponse(event, target));
      }
      return;
    }
  }

  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        let response;
        try {
          response = await fetch(request);
        } catch (err) {
          return (await cachedShell()) || Response.error();
        }
        if (response.ok) {
          // not awaited: the page gets its shell as it comes, and the worker lives until the
          // copy is kept (a put reads the whole body). A bundle asked for meanwhile may still
          // be answered by the old cache: a hashed file is the same file in either, and only
          // what the network gave is put in this one. A cache that cannot be written does not
          // cost the page.
          event.waitUntil(keepShell(response.clone()).catch(() => undefined));
        }
        return response;
      })(),
    );
    return;
  }

  if (isCacheFirst(url.pathname)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(isLongLived(url.pathname) ? FILES : CACHE);
        const own = await cache.match(request);
        if (own) return own;
        const older = await caches.match(request);
        // a shell an older worker kept under a file's URL is no copy of that file
        if (older && !isPage(older)) {
          // a file only the cache of the name before still holds, asked for while the new shell's
          // copy is being kept: it is kept here too, so keepShell's retirement of that cache does
          // not take the only copy of a file the new shell uses. Another build's file is only answered.
          if (ofThisBuild(url.pathname)) event.waitUntil(cache.put(request, older.clone()).catch(() => undefined));
          return older;
        }
        const response = await fetch(request);
        // a file the server no longer has is not kept: an old page asking for its own build's
        // bundle after an update gets a 404, or the shell from a server older than that answer
        if (response.ok && response.type === "basic" && !isPage(response)) {
          cache.put(request, response.clone());
        }
        return response;
      })(),
    );
  }
});

// Web push (server/push.ts sends, shared/protocol.ts PushPayload is the JSON). Every
// push shows a notification: Safari revokes a subscription whose pushes stay silent.
// A window of the app that is visible right now already shows the change in its
// sidebar, so the notification then arrives without sound or vibration.
// In the hosted shell every PC has a worker of its own, scoped to `/s/<server_id>/`
// (src/lib/shellMode.ts), with its own subscription: only that PC pushes to it, and
// only that PC's windows are this worker's to tell or to open.

/** The PC this worker is the hosted shell's worker for; null for the worker a PC's own server serves. */
function shellServerId() {
  const scope = self.registration && self.registration.scope;
  const match = scope ? /^\/s\/([0-9a-f]{32})\/$/.exec(new URL(scope).pathname) : null;
  return match ? match[1] : null;
}

/** A window of this worker's PC: in the hosted shell the origin's other windows are other PCs'. */
function ofThisPc(url) {
  if (shellServerId() === null) return true;
  try { return new URL(url).pathname.startsWith(`/s/${shellServerId()}/`); } catch { return false; }
}

self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (err) {
    payload = { body: event.data ? event.data.text() : "" };
  }
  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      const watching = windows.some((client) => client.visibilityState === "visible" && ofThisPc(client.url));
      await self.registration.showNotification(payload.title || "Ovis", {
        body: payload.body || "",
        tag: payload.tag || "herdr",
        renotify: !watching,
        silent: watching,
        data: { pane_id: payload.pane_id || null, machine_id: payload.machine_id || "local", workspace_id: payload.workspace_id || null },
        icon: "/icons/icon-192.png?v=sheep1",
        // Android's status bar and small icon: white on transparent, or Chrome's bell
        badge: "/icons/badge-96.png?v=sheep1",
      });
    })(),
  );
});

/**
 * A window that runs the app and so takes a "select-pane": the shell's own paths only. Not a
 * markdown reader tab (`?read=`, or `#read=` in the hosted shell, which keeps a page's query in its
 * fragment: src/lib/pageQuery.ts; src/lib/fileReader.ts renders FileReader there instead of App),
 * nor a raw file or HTML page the file viewer opened in a tab of its own (those are /api/
 * responses), nor any shipped file (an icon, /social-preview.png, a notice): a path whose last
 * part has an extension is a file, except the shell's own index.html.
 */
function isAppWindow(url) {
  let parsed;
  try { parsed = new URL(url); } catch { return false; }
  const path = parsed.pathname;
  if (path.startsWith("/api/") || path === "/ws") return false;
  const last = path.slice(path.lastIndexOf("/") + 1);
  if (last.includes(".") && last !== "index.html") return false;
  // as src/lib/pageQuery.ts pageSearch reads it: a query left from an older build first
  const query = shellServerId() !== null && parsed.search.length <= 1 && parsed.hash.length > 1 ? new URLSearchParams(parsed.hash.slice(1)) : parsed.searchParams;
  return (query.get("read") ?? "").trim() === "";
}

// Tap: bring the app forward on that pane - an open window is told which pane
// (App listens), a closed app opens on /?pane=<id>.
let latestNotificationClick = 0;
let latestNotificationSelection = null;
self.addEventListener("notificationclick", (event) => {
  const click = ++latestNotificationClick;
  event.notification.close();
  const paneId = event.notification.data ? event.notification.data.pane_id : null;
  const machineId = event.notification.data?.machine_id || "local";
  // the workspace the pane was last seen in: an ended pane's tap opens it (src/lib/deepLink.ts)
  const workspaceId = event.notification.data?.workspace_id || null;
  const selection = paneId ? { type: "select-pane", pane_id: paneId, machine_id: machineId, view: "chat", ...(workspaceId ? { workspace_id: workspaceId } : {}) } : null;
  // Remember the intent before any lookup: an older focus can finish while this one
  // is still finding its window.
  latestNotificationSelection = selection;
  // a tapped pane alert, for the daily anonymous usage counts (server/telemetry.ts): posted only when
  // the server says the counts are on and their notice was shown, so nothing tells it of a tap while
  // they are off; a refusal (signed out, an older server) changes nothing
  if (paneId && typeof self.fetch === "function") {
    event.waitUntil((async () => {
      const status = await self.fetch("/api/telemetry", { cache: "no-store" });
      if (!status.ok) return;
      const counts = await status.json();
      if (counts?.enabled !== true || counts.blocked_by_env !== false || counts.notice_seen !== true) return;
      await self.fetch("/api/telemetry", {
        method: "POST",
        headers: { "content-type": "application/json", "x-herdr-update": "1" },
        body: JSON.stringify({ alert_opened: true }),
      });
    })().catch(() => {}));
  }
  event.waitUntil(
    (async () => {
      // only an app window handles the selection: focusing a reader tab would swallow the tap
      const windows = (await self.clients.matchAll({ type: "window", includeUncontrolled: true }))
        .filter((client) => isAppWindow(client.url) && ofThisPc(client.url));
      if (click !== latestNotificationClick) return;
      // the app's own path: the PC's scope in the hosted shell, whose host never hears which pane:
      // there the pane rides in the fragment (src/lib/pageQuery.ts)
      const home = shellServerId() === null ? "/" : `/s/${shellServerId()}/`;
      const url = paneId ? `${home}${shellServerId() === null ? "?" : "#"}machine=${encodeURIComponent(machineId)}${workspaceId ? `&ws=${encodeURIComponent(workspaceId)}` : ""}&pane=${encodeURIComponent(paneId)}&view=chat` : home;
      const selectLatest = (client) => { if (client && latestNotificationSelection) client.postMessage(latestNotificationSelection); };
      const open = async () => {
        // An opening can also finish after a newer tap. Repair that returned
        // window, while its URL still selects the original pane on a cold start.
        selectLatest(await self.clients.openWindow(url));
      };
      const target = windows.find((client) => client.focused) || windows[0];
      if (target) {
        const select = () => { if (selection) target.postMessage(selection); };
        // Name the pane before focus(): a focus() that iOS refuses or resolves late must not
        // swallow it. A page frozen in the background may need the selection again
        // once its focus completes.
        select();
        try {
          await target.focus();
        } catch (err) {
          // that window cannot be brought forward: open the app on the pane instead
          if (click === latestNotificationClick) await open();
          return;
        }
        // Different windows finish focus independently. A late older focus can put
        // its window in front after a newer tap focused another one. Give whichever
        // window just came forward the latest selection, without another focus loop.
        selectLatest(target);
        return;
      }
      await open();
    })(),
  );
});

/**
 * The hosted shell's database (src/lib/relay/device.ts openDatabase: the same name, version and
 * stores): `pending-push` holds, per PC, the subscription its worker could not hand over itself.
 */
function openRelayDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("ovis-relay", 2);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("devices")) db.createObjectStore("devices", { keyPath: "server_id" });
      if (!db.objectStoreNames.contains("pending-push")) db.createObjectStore("pending-push", { keyPath: "server_id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/** Keeps `subscription` for the PC to be told on the shell's next connection (src/lib/push.ts registerPendingPush). */
async function keepPendingPush(serverId, subscription, oldEndpoint) {
  const db = await openRelayDatabase();
  try {
    await new Promise((resolve, reject) => {
      const tx = db.transaction("pending-push", "readwrite");
      const store = tx.objectStore("pending-push");
      const request = store.get(serverId);
      request.onsuccess = () => {
        const held = request.result;
        // rotated again before the PC heard of the last one: the endpoint the PC knows is still that one's old
        const old = held && held.subscription.endpoint === oldEndpoint ? held.old_endpoint : oldEndpoint;
        store.put({ server_id: serverId, subscription, old_endpoint: old });
      };
      tx.oncomplete = () => resolve();
      tx.onabort = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}

// The browser rotated the subscription (Firefox does; Chrome rarely): hand the server
// the new endpoint and drop the old one, or pushes stop until the app is next opened.
// The hosted shell's worker cannot reach its PC (only a window holds the relay channel):
// it keeps the subscription for the PC and tells this PC's open windows, whose shell
// registers it over the relay; with none open the shell does on its next start.
self.addEventListener("pushsubscriptionchange", (event) => {
  const serverId = shellServerId();
  if (serverId !== null) {
    event.waitUntil(
      (async () => {
        const previous = event.oldSubscription;
        let fresh = event.newSubscription;
        if (!fresh && previous && previous.options.applicationServerKey) {
          fresh = await self.registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: previous.options.applicationServerKey });
        }
        // no key to subscribe with here: the app subscribes again on its next start (src/lib/push.ts)
        if (!fresh) return;
        await keepPendingPush(serverId, fresh.toJSON(), previous ? previous.endpoint : null);
        const windows = (await self.clients.matchAll({ type: "window", includeUncontrolled: true }))
          .filter((client) => isAppWindow(client.url) && ofThisPc(client.url));
        for (const client of windows) client.postMessage({ type: "push-subscription-change" });
      })(),
    );
    return;
  }
  const post = (method, body) =>
    fetch("/api/push/subscribe", { method, headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  event.waitUntil(
    (async () => {
      const previous = event.oldSubscription;
      let fresh = event.newSubscription;
      if (!fresh) {
        const key = previous && previous.options.applicationServerKey
          ? previous.options.applicationServerKey
          : (await (await fetch("/api/push")).json()).public_key;
        fresh = await self.registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key });
      }
      await post("POST", { subscription: fresh.toJSON() });
      if (previous) await post("DELETE", { endpoint: previous.endpoint });
    })(),
  );
});
