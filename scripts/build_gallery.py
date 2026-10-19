#!/usr/bin/env python3
"""Github Actions: PDF ONLY -> responsive gallery. Only processing previews; original PDFs never changed."""
import json, re
from pathlib import Path
import fitz
ROOT=Path(__file__).resolve().parents[1]
ROOT.joinpath('gallery','pages').mkdir(parents=True,exist_ok=True)
initial=[{'id':f'TB-DESIGN-COLLECTION-001-P{i:03}', 'title':f'Collection 001 · Page {i}', 'src':f'assets/designs/TB-DESIGN-{i:03}.webp', 'file':'Bundled reference collection 001','page':i} for i in range(1,49)]
all_items=list(initial)
for pdf in sorted(ROOT.joinpath('pdf-library').glob('*.pdf'), key=lambda x:x.name.casefold()):
    name=pdf.stem
    slug=re.sub(r'[^a-zA-Z0-9_-]','-',name)[:80]
    try:
        with fitz.open(pdf) as doc:
            print('Importing',pdf.name, len(doc),'pages')
            for i,page in enumerate(doc):
                uid=f'{slug}-P{i+1:04}'
                dest=ROOT/'gallery'/'pages'/f'{uid}.webp'
                # 950px wide keeps load manageable, max 1.5x zoom
                scale=min(1.6,950/max(page.rect.width,1))
                pix=page.get_pixmap(matrix=fitz.Matrix(scale,scale),alpha=False)
                pix.pil_save(dest,format='WEBP',quality=78,method=4)
                all_items.append({'id':uid,'title':f'{name} — Page {i+1}', 'src':f'gallery/pages/{uid}.webp','file':f'pdf-library/{pdf.name}','page':i+1})
    except Exception as e:
        raise SystemExit(f'Invalid PDF {pdf.name}: {e}')
(ROOT/'gallery'/'catalog.json').write_text(json.dumps({'designs':all_items},ensure_ascii=False),encoding='utf-8')
print('TOTAL published design slides:',len(all_items))
