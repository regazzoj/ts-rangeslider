import {IRangeSliderConfiguration} from "../interfaces/range-slider-configuration";
import {SkinType, SliderType} from "../enums";

export class RangeSliderConfigurationUtil {
    private static defaultConfig: IRangeSliderConfiguration<number> = {
        maxInterval: NaN,
        minInterval: NaN,
        from: NaN,
        fromMax: NaN,
        fromMin: NaN,
        to: NaN,
        toMax: NaN,
        toMin: NaN,
        block: false,
        decorateBoth: true,
        disable: false,
        extraClasses: "",
        forceEdges: false,
        fromFixed: false,
        fromShadow: false,
        grid: true,
        gridMargin: true,
        gridNum: 4,
        gridSnap: false,
        hideFromTo: false,
        hideMinMax: false,
        inputValuesSeparator: ";",
        keyboard: true,
        max: 100,
        min: 10,
        prettifyEnabled: true,
        prettifySeparator: " ",
        skin: SkinType.flat,
        step: 1,
        toFixed: false,
        toShadow: false,
        type: SliderType.single,
        values: [],
        prettyValues: [],
        valuesSeparator: "-",
        dragInterval: false
    };

    public static initializeConfiguration(configuration: Partial<IRangeSliderConfiguration<number | string>>, inputValues?: string): IRangeSliderConfiguration<number> {
        const configurationOutput = RangeSliderConfigurationUtil.mergeConfigurations(RangeSliderConfigurationUtil.defaultConfig, configuration);
        if (inputValues !== undefined && inputValues !== "") {
            const givenValues = inputValues.split(configuration.inputValuesSeparator || ";");

            if (givenValues.length < 2) {
                throw Error("Input value needs two values with a separator between (';' by default)");
            }
            const values: (number | string)[] = [];
            if (givenValues[0]) {
                values.push(RangeSliderConfigurationUtil.getValue(givenValues[0]));
            }
            if (givenValues[1]) {
                values.push(RangeSliderConfigurationUtil.getValue(givenValues[1]));
            }

            if (configuration && configuration.values && configuration.values.length) {
                configurationOutput.from = configuration.values.indexOf(values[0]);
                configurationOutput.to = configuration.values.indexOf(values[1]);
            } else {
                configurationOutput.from = values[0] as number;
                configurationOutput.to = values[1] as number;
            }
        }

        return configurationOutput;
    }

    public static mergeConfigurations(baseConfiguration: IRangeSliderConfiguration<number | string>, newConfiguration?: Partial<IRangeSliderConfiguration<number | string>>, updateCheck?: { from: number; to: number }): IRangeSliderConfiguration<number> {
        const configurationOutput = RangeSliderConfigurationUtil.convertConfiguration({...baseConfiguration, ...newConfiguration});
        return RangeSliderConfigurationUtil.checkConfiguration(configurationOutput, updateCheck);
    }

    public static convertConfiguration(configuration: IRangeSliderConfiguration<number|string>): IRangeSliderConfiguration<number> {
        if (typeof configuration.min === "string") configuration.min = parseFloat(configuration.min);
        if (typeof configuration.max === "string") configuration.max = parseFloat(configuration.max);
        if (typeof configuration.from === "string") configuration.from = parseFloat(configuration.from);
        if (typeof configuration.to === "string") configuration.to = parseFloat(configuration.to);
        if (typeof configuration.step === "string") configuration.step = parseFloat(configuration.step);

        if (typeof configuration.fromMin === "string") configuration.fromMin = parseFloat(configuration.fromMin);
        if (typeof configuration.fromMax === "string") configuration.fromMax = parseFloat(configuration.fromMax);
        if (typeof configuration.toMin === "string") configuration.toMin = parseFloat(configuration.toMin);
        if (typeof configuration.toMax === "string") configuration.toMax = parseFloat(configuration.toMax);

        if (typeof configuration.gridNum === "string") configuration.gridNum = parseFloat(configuration.gridNum);

        return configuration as IRangeSliderConfiguration<number>;
    }

    public static checkConfiguration(configuration: IRangeSliderConfiguration<number>, updateCheck?: { from: number; to: number }): IRangeSliderConfiguration<number> {
        if (configuration.max < configuration.min) {
            configuration.max = configuration.min;
        }

        RangeSliderConfigurationUtil.updatePrettyValues(configuration);

        if (isNaN(configuration.from)) {
            configuration.from = configuration.min;
        }

        if (isNaN(configuration.to)) {
            configuration.to = configuration.max;
        }

        if (configuration.type === "single") {

            if (configuration.from < configuration.min) configuration.from = configuration.min;
            if (configuration.from > configuration.max) configuration.from = configuration.max;

        } else {

            if (configuration.from < configuration.min) configuration.from = configuration.min;
            if (configuration.from > configuration.max) configuration.from = configuration.max;

            if (configuration.to < configuration.min) configuration.to = configuration.min;
            if (configuration.to > configuration.max) configuration.to = configuration.max;


            if (updateCheck?.from) {

                if (updateCheck?.from !== configuration.from) {
                    if (configuration.from > configuration.to) configuration.from = configuration.to;
                }
                if (updateCheck?.to !== configuration.to) {
                    if (configuration.to < configuration.from) configuration.to = configuration.from;
                }
            }

            if (configuration.from > configuration.to) configuration.from = configuration.to;
            if (configuration.to < configuration.from) configuration.to = configuration.from;

        }

        if (isNaN(configuration.step) || !configuration.step || configuration.step < 0) {
            configuration.step = 1;
        }

        if (configuration.from < configuration.fromMin) {
            configuration.from = configuration.fromMin;
        }

        if (configuration.from > configuration.fromMax) {
            configuration.from = configuration.fromMax;
        }

        if (configuration.to < configuration.toMin) {
            configuration.to = configuration.toMin;
        }

        if (configuration.from > configuration.toMax) {
            configuration.to = configuration.toMax;
        }

        // r = this.result
        // if (r) {
        //     if (r.min !== configuration.min) {
        //         r.min = configuration.min;
        //     }
        //
        //     if (r.max !== configuration.max) {
        //         r.max = configuration.max;
        //     }
        //
        //     if (r.from < r.min || r.from > r.max) {
        //         r.from = configuration.from;
        //     }
        //
        //     if (r.to < r.min || r.to > r.max) {
        //         r.to = configuration.to;
        //     }
        // }

        if (isNaN(configuration.minInterval) || !configuration.minInterval || configuration.minInterval < 0) {
            configuration.minInterval = 0;
        }

        if (isNaN(configuration.maxInterval) || !configuration.maxInterval || configuration.maxInterval < 0) {
            configuration.maxInterval = 0;
        }

        if (configuration.minInterval && configuration.minInterval > configuration.max - configuration.min) {
            configuration.minInterval = configuration.max - configuration.min;
        }

        if (configuration.maxInterval && configuration.maxInterval > configuration.max - configuration.min) {
            configuration.maxInterval = configuration.max - configuration.min;
        }
        return configuration;
    }

    private static getValue(givenValues: string): string | number {
        const parsedValue = parseFloat(givenValues[0]);
        if (!isNaN(parsedValue)) {
            return parsedValue;
        } else {
            return givenValues[0];
        }
    }

    private static updatePrettyValues(configuration: IRangeSliderConfiguration<number>) {
        if (configuration.values.length <= 0) {
            return;
        }
        configuration.prettyValues = [];
        configuration.min = 0;
        configuration.max = configuration.values.length - 1;
        configuration.step = 1;
        configuration.gridNum = configuration.max;
        configuration.gridSnap = true;
        configuration.values.forEach((currentValue, index) => {
            let value: number | string = parseFloat(typeof currentValue === "string" ? currentValue : currentValue.toString(10));

            if (!isNaN(value)) {
                configuration.values[index] = value;
                value = RangeSliderConfigurationUtil.prettify(configuration, value);
            } else {
                value = configuration.values[index];
            }

            configuration.prettyValues.push(value);
        });
    }

    public static prettify(configuration: IRangeSliderConfiguration<number>, value: number): string {
        if (!configuration.prettifyEnabled) {
            return value.toString(10);
        }

        if (configuration.prettify && typeof configuration.prettify === "function") {
            return configuration.prettify(value);
        } else {
            return RangeSliderConfigurationUtil.defaultPrettify(configuration, value.toString(10));
        }
    }

    private static defaultPrettify(configuration: IRangeSliderConfiguration<number>, value: string): string {
        return value.replace(/(\d{1,3}(?=(?:\d\d\d)+(?!\d)))/g, "$1" + configuration.prettifySeparator);
    }

    /**
     * Convert percent to real values
     */
    public static convertToValue(min: number, max: number, step: number, percent: number): number {
        let minLength: number, maxLength: number,
            avgDecimals = 0,
            abs = 0;

        const minDecimals = min.toString().split(".")[1],
            maxDecimals = max.toString().split(".")[1];

        if (percent === 0) {
            return min;
        }
        if (percent === 100) {
            return max;
        }


        if (minDecimals) {
            minLength = minDecimals.length;
            avgDecimals = minLength;
        }
        if (maxDecimals) {
            maxLength = maxDecimals.length;
            avgDecimals = maxLength;
        }
        if (minLength && maxLength) {
            avgDecimals = (minLength >= maxLength) ? minLength : maxLength;
        }

        if (min < 0) {
            abs = Math.abs(min);
            min = +(min + abs).toFixed(avgDecimals);
            max = +(max + abs).toFixed(avgDecimals);
        }

        let number = ((max - min) / 100 * percent) + min,
            result: number;
        const string = step.toString().split(".")[1];

        if (string) {
            number = +number.toFixed(string.length);
        } else {
            number = number / step;
            number = number * step;

            number = +number.toFixed(0);
        }

        if (abs) {
            number -= abs;
        }

        if (string) {
            result = +number.toFixed(string.length);
        } else {
            result = RangeSliderConfigurationUtil.toFixed(number);
        }

        if (result < min) {
            result = min;
        } else if (result > max) {
            result = max;
        }

        return result;
    }

    public static toFixed(num: number): number {
        return parseFloat(num.toFixed(20));
    }
}
