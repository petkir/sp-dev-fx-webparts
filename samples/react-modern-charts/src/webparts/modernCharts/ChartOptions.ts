export interface Theme {
    name: string;
    bgColors: Array<string>;
    hoverColors: Array<string>;
}


import { MChart } from './IModernChartsWebPartProps';



export interface ITheme {
    bgColors:string[],
    hoverColors:string[]
}
export interface IChartData {
    labels:string[],
        datasets: Array<{
            data: number[],
            backgroundColor: string[],
            hoverBackgroundColor: string[]
        }>
}

export interface IChartOptions {
    legend?: {
        display: boolean;
        layout: {
            padding: number;
        };
        position: string;
        labels?: {
            fontColor: string;
        };
        scales?: {
            yAxes?: Array<{
                ticks: {
                    beginAtZero: boolean;
                };
            }>;
        };
    }
}

export default class ChartOptions {

    public static _sampleData: Array<number> = [100, 50, 275, 100];
    public static _sampleCols: Array<string> = ['UPS','FedEx','USPS','OnTrac'];

    public static Options(): IChartOptions{
        return {
            legend: {
                display: true,
                layout: {
                    padding: 5
                },
                position: 'bottom',
                labels: {
                    fontColor: 'rgba(100, 100, 100, 1.0)'
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        };
    }

    public static Data(chart: MChart) {
            return  {
            labels: chart.labels,
            datasets: [{
            data: chart.data,
            backgroundColor: chart.config.bgColors,
            hoverBackgroundColor: chart.config.hoverColors
            }]
        };
    }

    public static RandomColors(): ITheme {
        const colors: ITheme= {bgColors: [], hoverColors: []};
        var colorTheme = new cs;
        var colorHue = Math.floor(Math.random() * 360);
        var colorPalette = colorTheme.from_hue(colorHue).scheme('analogic').variation('default');
        colors.bgColors = this.shuffleArray(colorPalette.add_complement(true).colors());
        colors.hoverColors = this.shuffleArray((colorPalette.add_complement(true).colors()).splice(6,6));
        colors.bgColors.forEach((hex,i)=> { colors.bgColors[i] = '#' + hex; });
        colors.hoverColors.forEach((hex,i)=> { colors.hoverColors[i] = '#' + hex; });

        return colors;
    }
    public static SampleData() {
        var theme = this.RandomColors();
        return  {
            labels: [
                'Red',
                'Green',
                'Yellow',
                '??'
            ],
            datasets: [{
            data: [100, 50, 275, 100],
            backgroundColor: theme.bgColors,
            hoverBackgroundColor: theme.hoverColors
            }]
        };
    }

    public static shuffleArray(array:string[]): string[] {
        // Fisher-Yates (aka Knuth) Shuffle
        var currentIndex = array.length, temporaryValue, randomIndex ;
        while (0 !== currentIndex) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    }
}
