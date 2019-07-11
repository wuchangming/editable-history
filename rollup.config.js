import commonjs from 'rollup-plugin-commonjs'

const config = {
    input: 'dist/commonjs/index.js',
    output: {
        format: 'umd',
        globals: {
            editableHistory: 'EditableHistory'
        },
        name: 'editableHistory'
    },
    plugins: [commonjs()]
}

export default config
