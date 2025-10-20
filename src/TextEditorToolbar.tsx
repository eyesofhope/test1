import React from 'react';
import './TextEditorToolbar.css';
import type { DocumentEditorContainerComponent } from '@syncfusion/ej2-react-documenteditor';

type Props = {
  editorRef: React.RefObject<DocumentEditorContainerComponent | null>;
  fontFamilies?: string[];
  fontSizes?: number[];
  paragraphStyles?: string[];
  highlightOptions?: { name: any; color: string }[];
  isMobile?: boolean;
};

const TextEditorToolbar: React.FC<Props> = ({
  editorRef,
  fontFamilies = ['Calibri','Arial','Times New Roman','Georgia','Courier New','Roboto'],
  fontSizes = [9,10,11,12,14,16,18,20,22,24,28,32],
  paragraphStyles = ['Normal','No Spacing','Heading 1','Heading 2','Heading 3','Title'],
  highlightOptions = [
    { name: 'NoColor', color: '#ffffff' },
    { name: 'Yellow', color: '#FDE047' },
    { name: 'BrightGreen', color: '#22C55E' },
    { name: 'Turquoise', color: '#14B8A6' },
    { name: 'Pink', color: '#EC4899' },
    { name: 'Blue', color: '#3B82F6' },
    { name: 'Red', color: '#EF4444' },
    { name: 'Gray25', color: '#D1D5DB' }
  ],
  isMobile = false
}) => {
  const editor = () => editorRef.current?.documentEditor;

  const execBold = () => editor()?.editor.toggleBold();
  const execItalic = () => editor()?.editor.toggleItalic();
  const execUnderline = () => editor()?.editor.toggleUnderline();
  const strike = () => editor()?.editor.toggleStrikethrough();
  const subscript = () => editor()?.editor.toggleSubscript();
  const superscript = () => editor()?.editor.toggleSuperscript();
  const alignLeft = () => editor()?.editor.toggleTextAlignment('Left');
  const alignCenter = () => editor()?.editor.toggleTextAlignment('Center');
  const alignRight = () => editor()?.editor.toggleTextAlignment('Right');
  const alignJustify = () => editor()?.editor.toggleTextAlignment('Justify');
  const bullets = () => editor()?.editor.applyBullet('\u2022', 'Symbol');
  const numbering = () => editor()?.editor.applyNumbering('%1.', 'Arabic');
  const indentInc = () => editor()?.editor.increaseIndent();
  const indentDec = () => editor()?.editor.decreaseIndent();

  const setFontFamily = (value: string) => {
    if (editor()?.selection) editor()!.selection.characterFormat.fontFamily = value;
  };
  const setFontSize = (value: number) => {
    if (editor()?.selection) editor()!.selection.characterFormat.fontSize = value;
  };
  const setFontColor = (value: string) => {
    if (editor()?.selection) editor()!.selection.characterFormat.fontColor = value;
  };
  const setHighlight = (value: any) => editor()?.editor.toggleHighlightColor(value);
  const applyStyle = (name: string) => editor()?.editor.applyStyle(name);

  // Simplified mobile options
  const mobileFontFamilies = ['Arial', 'Times New Roman', 'Calibri'];
  const mobileFontSizes = [10, 12, 14, 16, 18, 20];
  const displayFontFamilies = isMobile ? mobileFontFamilies : fontFamilies;
  const displayFontSizes = isMobile ? mobileFontSizes : fontSizes;

  return (
    <div className="text-editing-toolbar text-panel" role="region" aria-label="Text formatting toolbar">
      <div className="text-row">
        <select className="text-select" aria-label="Font family" onChange={(e)=>setFontFamily(e.target.value)}>
          {displayFontFamilies.map(f=> <option key={f} value={f}>{f}</option>)}
        </select>
        <select className="text-select narrow" aria-label="Font size" defaultValue={11} onChange={(e)=>setFontSize(parseInt(e.target.value,10))}>
          {displayFontSizes.map(s=> <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div className="text-row">
        <button type="button" className="text-btn" onClick={execBold} aria-label="Bold">B</button>
        <button type="button" className="text-btn" onClick={execItalic} aria-label="Italic"><i>I</i></button>
        <button type="button" className="text-btn" onClick={execUnderline} aria-label="Underline"><u>U</u></button>
        {!isMobile && <button type="button" className="text-btn" onClick={strike} aria-label="Strikethrough"><s>S</s></button>}
        {!isMobile && <button type="button" className="text-btn" onClick={subscript} aria-label="Subscript">x₂</button>}
        {!isMobile && <button type="button" className="text-btn" onClick={superscript} aria-label="Superscript">xⁿ</button>}
      </div>
      <div className="text-row">
        <label className="text-label" htmlFor="fontColor">A</label>
        <input id="fontColor" className="text-color" type="color" defaultValue="#000000" aria-label="Font color" onChange={(e)=>setFontColor(e.target.value)} />
        {!isMobile && <select className="text-select" aria-label="Highlight color" defaultValue={'NoColor'} onChange={(e)=>setHighlight(e.target.value)}>
          {highlightOptions.map(h=> <option key={h.name} value={h.name}>{h.name}</option>)}
        </select>}
      </div>
      {!isMobile && <div className="text-row">
        <select className="text-select" aria-label="Paragraph style" defaultValue={'Normal'} onChange={(e)=>applyStyle(e.target.value)}>
          {paragraphStyles.map(s=> <option key={s} value={s}>{s}</option>)}
        </select>
      </div>}
      <div className="text-row">
        <button type="button" className="text-btn" onClick={alignLeft} aria-label="Align left">⟸</button>
        <button type="button" className="text-btn" onClick={alignCenter} aria-label="Align center">↔</button>
        <button type="button" className="text-btn" onClick={alignRight} aria-label="Align right">⟹</button>
        <button type="button" className="text-btn" onClick={alignJustify} aria-label="Justify">≡</button>
      </div>
      <div className="text-row">
        <button type="button" className="text-btn" onClick={bullets} aria-label="Bullets">• • •</button>
        <button type="button" className="text-btn" onClick={numbering} aria-label="Numbering">1. 2. 3.</button>
        <button type="button" className="text-btn" onClick={indentDec} aria-label="Decrease indent">⇤</button>
        <button type="button" className="text-btn" onClick={indentInc} aria-label="Increase indent">⇥</button>
      </div>
    </div>
  );
};

export default TextEditorToolbar;

export {};
