/**
 * Based on http://github.com/stewartlord/identicon.js
 *
 * Released under the BSD license
 * http://www.opensource.org/licenses/bsd-license.php
 */

type TRGBa = [number, number, number, number];

class Rectangle {
    constructor(
        public readonly x: number,
        public readonly y: number,
        public readonly width: number,
        public readonly height: number,
        public readonly color: string
    ) {}
}

class SvgImage {
    private size: number;
    private foreground: string;
    private background: string;
    private rectangles: Rectangle[];

    constructor(size: number, foreground: TRGBa, background: TRGBa) {
        this.size = size;
        this.foreground = this.color(foreground);
        this.background = this.color(background);
        this.rectangles = [];
    }

    private color(rgba: TRGBa): string {
        const values = [...rgba].map(Math.round);
        return `rgba(${values.join(',')})`;
    }

    private getDump(): string {
        let xml = `<svg xmlns='http://www.w3.org/2000/svg' ` +
                  `width='${this.size}' height='${this.size}' ` +
                  `style='background-color:${this.background};'>` +
                  `<g style='fill:${this.foreground}; stroke:${this.foreground};` +
                  `stroke-width:${this.size * .005};'>`;

        for (let i = 0; i < this.rectangles.length; i++) {
            const rect = this.rectangles[i];
            if (rect.color == this.background) continue;
            xml += `<rect x='${rect.x}' y='${rect.y}' width='${rect.width}' height='${rect.height}'/>`;
        }

        xml += `</g></svg>`;

        return xml;
    }

    addRect(x: number, y: number, w: number, h: number, color: TRGBa): void {
        const rect = new Rectangle(x, y, w, h, this.color(color));
        this.rectangles.push(rect);
    }

    getBase64() {
        return btoa(this.getDump());
    }
}

export class MyIdenticon {
    private background: TRGBa;

    private foreground: TRGBa;

    private margin: number;

    private size: number;

    private readonly hash: string;

    constructor(hash: string) {
        if (hash.length < 15) {
            throw 'A hash of at least 15 characters is required.';
        }
        this.hash = hash;

        this.background = [240, 240, 240, 255];
        this.foreground = [120, 240, 120, 255];
        this.margin = .08;
        this.size = 64;
    }

    toString(): string {
        return this.render().getBase64();
    }

    private render(): SvgImage {
        const image = new SvgImage(this.size, this.foreground, this.background);
        const baseMargin = Math.floor(this.size * this.margin);
        const cell       = Math.floor((this.size - (baseMargin * 2)) / 5);
        const margin     = Math.floor((this.size - cell * 5) / 2);

        const saturation = .7;
        const brightness = .5;
        const hue = parseInt(this.hash.substring(-7), 16) / 0xfffffff;

        this.foreground = this.hsl2rgb(hue, saturation, brightness);

        for (let i = 0; i < 15; i++) {
            const color = parseInt(this.hash.charAt(i), 16) % 2 ? this.background : this.foreground;
            if (i < 5) {
                image.addRect(2 * cell + margin, i * cell + margin, cell, cell, color);
            } else if (i < 10) {
                image.addRect(1 * cell + margin, (i - 5) * cell + margin, cell, cell, color);
                image.addRect(3 * cell + margin, (i - 5) * cell + margin, cell, cell, color);
            } else if (i < 15) {
                image.addRect(0 * cell + margin, (i - 10) * cell + margin, cell, cell, color);
                image.addRect(4 * cell + margin, (i - 10) * cell + margin, cell, cell, color);
            }
        }

        return image;
    }

    // ~_~ https://gist.github.com/aemkei/1325937
    private hsl2rgb(h: number, s: number, b: number): TRGBa {
        h *= 6;
        const list = [
            b += s *= b < .5 ? b : 1 - b,
            b - h % 1 * s * 2,
            b -= s *= 2,
            b,
            b + h % 1 * s,
            b + s
        ];

        return [
            list[ ~~h    % 6 ] * 255,
            list[ (h|16) % 6 ] * 255,
            list[ (h|8)  % 6 ] * 255,
            255
        ];
    }
}