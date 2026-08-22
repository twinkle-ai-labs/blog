// Packed-bubble tag chart. Colours come from the page's CSS variables so the
// chart follows the light/dark theme instead of the hard-coded palette.
(function () {
    if (typeof Highcharts === 'undefined' || typeof tags === 'undefined') return;

    const container = document.getElementById('container');
    if (!container) return;

    let chart = null;

    const token = function (name) {
        return getComputedStyle(document.body).getPropertyValue(name).trim();
    };

    const buildOptions = function () {
        const labelColor = token('--token-text');
        const bubbleColor = token('--token-accent');

        return {
            chart: {
                type: 'packedbubble',
                height: '460px',
                backgroundColor: 'transparent',
                style: {fontFamily: 'inherit'}
            },
            title: {text: undefined},
            credits: {enabled: false},
            legend: {enabled: false},
            tooltip: {
                useHTML: true,
                // 문장은 템플릿이 번역해 건네준다 (template/base.html).
                pointFormat: '<b>{point.name}</b>: ' +
                    ((window.I18N || {}).noteCount || '{point.value}개의 메모')
            },
            plotOptions: {
                series: {
                    cursor: 'pointer',
                    point: {
                        events: {
                            click: function () {
                                location.href = this.options.url;
                            }
                        }
                    }
                },
                packedbubble: {
                    minSize: '30%',
                    maxSize: '120%',
                    zMin: 0,
                    zMax: 1000,
                    layoutAlgorithm: {
                        splitSeries: false,
                        gravitationalConstant: 0.02
                    },
                    dataLabels: {
                        enabled: true,
                        format: '{point.name}',
                        style: {
                            color: labelColor,
                            textOutline: 'none',
                            fontWeight: '600',
                            fontSize: '0.8rem'
                        }
                    }
                }
            },
            series: [{
                name: 'Tag',
                color: bubbleColor,
                data: tags.map(function (e) {
                    return {name: e[0], value: e[1], url: e[2]};
                })
            }]
        };
    };

    const render = function () {
        if (chart) chart.destroy();
        chart = Highcharts.chart('container', buildOptions());
    };

    render();

    // Repaint with the new tokens whenever the theme flips.
    if (typeof Store !== 'undefined') {
        Store.theme.observer.addObserver(render);
    }
})();
