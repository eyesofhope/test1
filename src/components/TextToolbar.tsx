import React, { useState } from 'react';
import './TextToolbar.css';

export type TextToolbarProps = {
  onToggleSubmenu?: (open: boolean) => void;
  initialOpen?: boolean;
};

const fontFamilies = ['Calibri','Arial','Times New Roman','Georgia','Courier New','Roboto'];
const fontSizes = [8,9,10,11,12,14,16,18,20,22,24,28,32,36,48,72];

export default function TextToolbar({ onToggleSubmenu, initialOpen=false }: TextToolbarProps) {
  const [submenuOpen, setSubmenuOpen] = useState(initialOpen);
  const [fontFamily, setFontFamily] = useState(fontFamilies[0]);
  const [fontSize, setFontSize] = useState<number>(11);

  const toggleSubmenu = (next?: boolean) => {
    const open = typeof next === 'boolean' ? next : !submenuOpen;
    setSubmenuOpen(open);
    onToggleSubmenu?.(open);
  };

  return (
    <div className="text-toolbar-wrapper">
      <div className="main-toolbar" role="toolbar" aria-label="Main editor toolbar">
        <button className="tool-btn" title="Bold">B</button>
        <button className="tool-btn" title="Italic"><i>I</i></button>
        <button className="tool-btn" title="Underline"><u>U</u></button>
        <button className="tool-btn" title="Undo">↺</button>
        <button className="tool-btn" title="Redo">↻</button>

        <select className="tool-select" value={fontFamily} onChange={(e)=>setFontFamily(e.target.value)} title="Font family">
          {fontFamilies.map(f=> <option key={f} value={f}>{f}</option>)}
        </select>
        <select className="tool-select narrow" value={fontSize} onChange={(e)=>setFontSize(parseInt(e.target.value,10))} title="Font size">
          {fontSizes.map(s=> <option key={s} value={s}>{s}pt</option>)}
        </select>

        <input className="tool-color" type="color" title="Text color" />

        <div className="divider" />

        <button className="tool-btn" title="Align left">⟸</button>
        <button className="tool-btn" title="Align center">↔</button>
        <button className="tool-btn" title="Align right">⟹</button>
        <button className="tool-btn" title="Justify">≡</button>

        <button className="tool-btn" title="Bulleted list">• • •</button>
        <button className="tool-btn" title="Numbered list">1. 2.</button>

        <button className="tool-btn" title="Insert image">🖼</button>
        <button className="tool-btn" title="Insert link">🔗</button>

        <div style={{flex:1}} />

        <button className="tool-btn properties-toggle" title="Toggle text submenu" onClick={()=>toggleSubmenu()}>Properties</button>
      </div>

      <div className={`submenu ${submenuOpen? 'open': ''}`} aria-hidden={!submenuOpen}>
        <div className="submenu-row">
          <label>Font style:</label>
          <select defaultValue="sans" className="submenu-select">
            <option value="sans">Sans-serif</option>
            <option value="serif">Serif</option>
            <option value="monospace">Monospace</option>
          </select>

          <label>Size</label>
          <input type="range" min={8} max={72} value={fontSize} onChange={(e)=>setFontSize(parseInt(e.target.value,10))} />
          <span className="size-value">{fontSize}pt</span>

          <label>Text color</label>
          <input type="color" />
          <label>Highlight</label>
          <input type="color" />
        </div>

        <div className="submenu-row">
          <label>Indent</label>
          <button className="submenu-btn">Decrease</button>
          <button className="submenu-btn">Increase</button>

          <label>Line spacing</label>
          <select className="submenu-select">
            <option>1.0</option>
            <option>1.15</option>
            <option>1.5</option>
            <option>2.0</option>
          </select>

          <button className="submenu-btn">Superscript</button>
          <button className="submenu-btn">Subscript</button>
        </div>
      </div>
    </div>
  );
}
