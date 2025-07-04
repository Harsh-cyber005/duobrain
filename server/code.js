const jsonfile = require('jsonfile');
const moment = require('moment');
const simpleGit = require('simple-git');
const FILE_PATH = './data.json';

const makeCommit = n => {
    if (n === 0) {
        console.log('All commits made');
        simpleGit().push();
        return;
    }

    const x = Math.floor(Math.random() * 55);
    const y = Math.floor(Math.random() * 7);
    let date = moment().subtract(1, 'y').add(1, 'd').add(x, 'w').add(y, 'd');

    if (date.isAfter(moment())) {
        console.log(`Skipping commit ${n} due to future date: ${date.format()}`);
        return makeCommit(n - 1);
    }

    const DATE = date.format();
    const data = { date: DATE };

    jsonfile.writeFile(FILE_PATH, data, () => {
        simpleGit().add(FILE_PATH).commit(`Commit ${n}`, {
            '--date': DATE
        }, makeCommit.bind(this, n - 1));
        console.log(`Commit ${n} made on ${DATE}`);
    });
};

const main = () => {
    jsonfile.writeFile(FILE_PATH, {}, () => {
        console.log('Data file created');
        makeCommit(50);
    });
};

main();
