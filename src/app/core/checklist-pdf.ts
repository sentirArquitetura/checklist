import { Injectable } from '@angular/core';
import { CANAIS, Canal } from './canais';
import { SENTIR, whatsappLegivel } from './config';
import { Lead } from './lead';

/** Tudo o que o PDF precisa saber sobre a resposta do visitante. */
export interface Resultado {
  lead: Lead;
  marcados: ReadonlySet<string>;
  total: number;
  alerta: boolean;
}

const CORAL = { r: 0.96, g: 0.58, b: 0.58 };
const MENTA = { r: 0.54, g: 0.77, b: 0.77 };
const TINTA = { r: 0.18, g: 0.17, b: 0.18 };
const SUAVE = { r: 0.42, g: 0.4, b: 0.41 };
const TRACO = { r: 0.87, g: 0.85, b: 0.85 };

/** Linha de identificação: nome, WhatsApp e, se houver, e-mail. */
export function identificacao(lead: Lead): string {
  return [lead.nome, lead.empresa, lead.cargo, lead.whatsapp, lead.email]
    .map((parte) => parte?.trim())
    .filter(Boolean)
    .join(' · ');
}

/** Veredito do resultado, já quebrado nas linhas do PDF. */
export function veredito(alerta: boolean): string[] {
  return alerta
    ? [
        'Seu escritório apresenta sinais de que já não acompanha as necessidades',
        'atuais da empresa. Um ambiente inadequado impacta produtividade,',
        'colaboração, experiência das equipes e percepção de valor da marca.',
      ]
    : [
        'Seu escritório está inteiro na maior parte dos canais. Vale olhar o que foi',
        'marcado: costumam ser os pontos que a equipe mais sente no dia a dia.',
        'A partir de três sinais, o ambiente já começa a atrapalhar a operação.',
      ];
}

/** Converte '#F2B441' para o formato de cor do pdf-lib. */
function hex(valor: string) {
  return {
    r: parseInt(valor.slice(1, 3), 16) / 255,
    g: parseInt(valor.slice(3, 5), 16) / 255,
    b: parseInt(valor.slice(5, 7), 16) / 255,
  };
}

/**
 * Monta o checklist respondido em PDF, no navegador.
 * A biblioteca só é baixada quando alguém pede o arquivo — por isso o import
 * dinâmico: ela não pesa no carregamento inicial da página.
 */
@Injectable({ providedIn: 'root' })
export class ChecklistPdf {
  async gerar(resultado: Resultado): Promise<Blob> {
    const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');

    const doc = await PDFDocument.create();
    doc.setTitle('Checklist — 10 sinais de que sua empresa precisa de um novo projeto corporativo');
    doc.setAuthor('Sentir Arquitetura');
    doc.setSubject('Diagnóstico sensorial do ambiente corporativo');

    const regular = await doc.embedFont(StandardFonts.Helvetica);
    const forte = await doc.embedFont(StandardFonts.HelveticaBold);

    const pagina = doc.addPage([595.28, 841.89]); // A4
    const { width, height } = pagina.getSize();
    const margem = 52;
    const util = width - margem * 2;
    let y = height - margem;

    const cor = (c: { r: number; g: number; b: number }) => rgb(c.r, c.g, c.b);

    // --- Cabeçalho: faixa dos dez canais, a mesma assinatura da página -----
    const largura = util / CANAIS.length;
    CANAIS.forEach((canal, i) => {
      const marcado = resultado.marcados.has(canal.id);
      pagina.drawRectangle({
        x: margem + i * largura,
        y: y - 6,
        width: largura - 2,
        height: 6,
        color: cor(hex(canal.cor)),
        opacity: marcado ? 1 : 0.28,
      });
    });
    y -= 34;

    // --- Logotipo -----------------------------------------------------------
    try {
      const bytes = await fetch('imagens/logo-sentir.png').then((r) => r.arrayBuffer());
      const logo = await doc.embedPng(bytes);
      const escala = 118 / logo.width;
      pagina.drawImage(logo, {
        x: margem,
        y: y - logo.height * escala,
        width: 118,
        height: logo.height * escala,
      });
      y -= logo.height * escala + 26;
    } catch {
      pagina.drawText('SENTIR ARQUITETURA', {
        x: margem,
        y,
        size: 12,
        font: forte,
        color: cor(TINTA),
      });
      y -= 32;
    }

    // --- Título -------------------------------------------------------------
    const titulo = ['10 sinais de que sua empresa', 'precisa de um novo projeto corporativo'];
    for (const linha of titulo) {
      pagina.drawText(linha, { x: margem, y, size: 19, font: forte, color: cor(TINTA) });
      y -= 25;
    }
    y -= 8;

    // --- Identificação ------------------------------------------------------
    const { lead } = resultado;
    pagina.drawText(identificacao(lead), {
      x: margem,
      y,
      size: 10,
      font: regular,
      color: cor(SUAVE),
    });
    y -= 14;
    pagina.drawText(
      `Respondido em ${new Date(lead.enviadoEm).toLocaleDateString('pt-BR')}`,
      { x: margem, y, size: 9, font: regular, color: cor(SUAVE) },
    );
    y -= 26;

    pagina.drawLine({
      start: { x: margem, y },
      end: { x: width - margem, y },
      thickness: 0.8,
      color: cor(TRACO),
    });
    y -= 30;

    // --- Os dez sinais ------------------------------------------------------
    for (const canal of CANAIS) {
      const marcado = resultado.marcados.has(canal.id);
      y = this.desenharSinal(pagina, canal, marcado, { margem, util, y, regular, forte, rgb });
    }

    y -= 10;
    pagina.drawLine({
      start: { x: margem, y },
      end: { x: width - margem, y },
      thickness: 0.8,
      color: cor(TRACO),
    });
    y -= 30;

    // --- Resultado ----------------------------------------------------------
    const caixa = 92;
    pagina.drawRectangle({
      x: margem,
      y: y - caixa,
      width: util,
      height: caixa,
      color: cor(resultado.alerta ? CORAL : MENTA),
      opacity: 0.22,
    });
    pagina.drawRectangle({
      x: margem,
      y: y - caixa,
      width: 4,
      height: caixa,
      color: cor(resultado.alerta ? CORAL : MENTA),
    });

    pagina.drawText(`SEU RESULTADO: ${resultado.total} DE 10 SINAIS`, {
      x: margem + 18,
      y: y - 26,
      size: 10,
      font: forte,
      color: cor(TINTA),
    });

    let yv = y - 44;
    for (const linha of veredito(resultado.alerta)) {
      pagina.drawText(linha, {
        x: margem + 18,
        y: yv,
        size: 9.5,
        font: regular,
        color: cor(SUAVE),
      });
      yv -= 13;
    }
    y -= caixa + 28;

    // --- Rodapé -------------------------------------------------------------
    pagina.drawText('Cada sinal marcado tem solução de projeto. Vamos conversar?', {
      x: margem,
      y,
      size: 11,
      font: forte,
      color: cor(TINTA),
    });
    y -= 16;
    pagina.drawText(`WhatsApp ${whatsappLegivel()}  ·  ${SENTIR.email}`, {
      x: margem,
      y,
      size: 9.5,
      font: regular,
      color: cor(SUAVE),
    });
    y -= 13;
    pagina.drawText('Sentir Arquitetura · Neuroarquitetura aplicada a ambientes corporativos', {
      x: margem,
      y,
      size: 9.5,
      font: regular,
      color: cor(SUAVE),
    });

    const bytes = await doc.save();
    return new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
  }

  /** Uma linha do checklist: marcador colorido, nome do canal e a pergunta. */
  private desenharSinal(
    pagina: any,
    canal: Canal,
    marcado: boolean,
    ctx: { margem: number; util: number; y: number; regular: any; forte: any; rgb: any },
  ): number {
    const { margem, util, regular, forte, rgb } = ctx;
    let { y } = ctx;
    const cor = (c: { r: number; g: number; b: number }) => rgb(c.r, c.g, c.b);

    // Caixa de marcação
    pagina.drawRectangle({
      x: margem,
      y: y - 10,
      width: 11,
      height: 11,
      borderColor: cor(marcado ? hex(canal.cor) : TRACO),
      borderWidth: 1,
      color: marcado ? cor(hex(canal.cor)) : undefined,
    });
    if (marcado) {
      pagina.drawText('X', {
        x: margem + 2.8,
        y: y - 8,
        size: 8,
        font: forte,
        color: rgb(1, 1, 1),
      });
    }

    // Nome do canal
    pagina.drawText(canal.nome.toUpperCase(), {
      x: margem + 22,
      y: y - 8,
      size: 8,
      font: forte,
      color: cor(marcado ? TINTA : SUAVE),
    });

    // Pergunta, quebrada na largura disponível
    const inicio = margem + 92;
    const larguraTexto = util - (inicio - margem);
    const linhas = this.quebrar(canal.pergunta, regular, 9.5, larguraTexto);
    let yl = y - 8;
    for (const linha of linhas) {
      pagina.drawText(linha, { x: inicio, y: yl, size: 9.5, font: regular, color: cor(TINTA) });
      yl -= 12;
    }

    return Math.min(y - 26, yl - 10);
  }

  /** Quebra o texto em linhas que cabem na largura dada. */
  private quebrar(texto: string, fonte: any, tamanho: number, largura: number): string[] {
    const palavras = texto.split(' ');
    const linhas: string[] = [];
    let atual = '';

    for (const palavra of palavras) {
      const tentativa = atual ? `${atual} ${palavra}` : palavra;
      if (fonte.widthOfTextAtSize(tentativa, tamanho) > largura && atual) {
        linhas.push(atual);
        atual = palavra;
      } else {
        atual = tentativa;
      }
    }
    if (atual) linhas.push(atual);
    return linhas;
  }

  /** Nome do arquivo baixado. */
  nomeArquivo(lead: Lead): string {
    const quem = (lead.empresa || lead.nome || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase();
    return `checklist-sentir-${quem || 'resultado'}.pdf`;
  }
}
