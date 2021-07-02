const path = require('path');
const fs = require('fs');
const expect = require('expect.js');
const parser = require('../lib/cue');

describe('cue-parser', function () {
  let sheet;

  const cueDir = path.join(__dirname, 'cue');

  describe('it should parse windows files with', () => {

    it('should skip newlines', function () {
      const data = fs.readFileSync(path.join(cueDir, '/sample-win.cue'));
      sheet = parser.parse(data, "utf-8");

      expect(sheet.catalog).to.be('3898347789120');

      expect(sheet.files).to.be.an('array');
      expect(sheet.files).to.have.length(1);
      expect(sheet.files[0].name).to.be('sample file.ape');
      expect(sheet.files[0].type).to.be('WAVE');

      const tracks = sheet.files[0].tracks;

      expect(tracks).to.be.an('array');
      expect(tracks).to.have.length(2);

      expect(tracks[1].number).to.be(2);
      expect(tracks[1].type).to.be('AUDIO');
    });
  });

  describe('it should parse linux files with', () => {
    beforeEach(() => {
      const data = fs.readFileSync(path.join(cueDir, '/sample.cue'));
      sheet = parser.parse(data, "utf-8");
    });

    it('should parse CATALOG', () => {
      expect(sheet.catalog).to.be('3898347789120');
    });

    it('should parse CDTEXTFILE', () => {
      expect(sheet.cdTextFile).to.be('C:\\LONG FILENAME.CDT');
    });

    it('should parse FILE', () => {
      expect(sheet.files).to.be.an('array');
      expect(sheet.files).to.have.length(1);
      expect(sheet.files[0].name).to.be('sample file.ape');
      expect(sheet.files[0].type).to.be('WAVE');
    });

    it('should parse Disk PERFORMER', () => {
      expect(sheet.performer).to.be('Sample performer');
    });

    it('should parse Disk SONGWRITER', () => {
      expect(sheet.songWriter).to.be('Sample songwriter');
    });

    it('should parse Disk TITLE', () => {
      expect(sheet.title).to.be('Sample title');
    });

    it('should parse all tracks of the file', () => {
      const tracks = sheet.files[0].tracks;

      expect(tracks).to.be.an('array');
      expect(tracks).to.have.length(3);

      expect(tracks[0].number).to.be(1);
      expect(tracks[0].type).to.be('AUDIO');

      expect(tracks[1].number).to.be(2);
      expect(tracks[1].type).to.be('AUDIO');

      expect(tracks[2].number).to.be(3);
      expect(tracks[2].type).to.be('AUDIO');
    });

    it('should parse all REMs', () => {
      expect(sheet.rem).to.be.an('array');
      expect(sheet.rem[0]).to.be('Comment in toplevel');
      expect(sheet.rem[1]).to.be('Comment in track');
    });

    describe('track detail infos', () => {
      let track1, track2, track3;

      beforeEach(function () {
        const tracks = sheet.files[0].tracks;

        track1 = tracks[0];
        track2 = tracks[1];
        track3 = tracks[2];
      });

      it('should parse FLAGS', function () {
        expect(track1.flags).to.be.an('array');
        expect(track1.flags[0]).to.be('DCP');
        expect(track1.flags[1]).to.be('PRE');
      });

      it('should parse track ISRC', function () {
        expect(track1.isrc).to.be('ABCDE1234567');
        expect(track2.isrc).to.be(null);
      });

      it('should parse track TITLE', function () {
        expect(track1.title).to.be('Sample track 1');
        expect(track2.title).to.be('Sample track 2');
        expect(track3.title).to.be('Sample track 3');
      });

      it('should parse track PERFORMER', function () {
        expect(track1.performer).to.be('Sample performer');
        expect(track2.performer).to.be('Sample performer');
      });

      it('should parse track SONGWRITER', function () {
        expect(track1.songWriter).to.be('Sample songwriter');
        expect(track2.songWriter).to.be('Sample songwriter');
      });

      it('should parse track INDEX', function () {
        expect(track1.indexes).to.have.length(2);
        expect(track1.indexes[0].number).to.be(0);
        expect(track1.indexes[0].time).to.eql({min: 0, sec: 0, frame: 0});
        expect(track1.indexes[1].number).to.be(1);
        expect(track1.indexes[1].time).to.eql({min: 0, sec: 0, frame: 33});

        expect(track2.indexes).to.have.length(2);
        expect(track2.indexes[0].number).to.be(0);
        expect(track2.indexes[0].time).to.eql({min: 0, sec: 5, frame: 10});
        expect(track2.indexes[1].number).to.be(1);
        expect(track2.indexes[1].time).to.eql({min: 0, sec: 5, frame: 23});

        expect(track3.indexes).to.have.length(2);
        expect(track3.indexes[0].number).to.be(0);
        expect(track3.indexes[0].time).to.eql({min: 9999, sec: 5, frame: 10});
        expect(track3.indexes[1].number).to.be(1);
        expect(track3.indexes[1].time).to.eql({min: 9999, sec: 5, frame: 23});
      });

      it('should parse track PREGAP', function () {
        expect(track1.pregap).to.eql({min: 0, sec: 2, frame: 0});
        expect(track2.pregap).to.be(null);
      });

      it('should parse track POSTGAP', function () {
        expect(track1.postgap).to.eql({min: 0, sec: 2, frame: 0});
        expect(track2.postgap).to.be(null);
      });
    });
  });

  describe('it should parse EAC generated CUE files', function () {

    it('parse: Frank Boeijen - Palermo - CD1.eac.cue', function () {
      const data = fs.readFileSync(path.join(cueDir, 'Frank Boeijen - Palermo - CD1.eac.cue'));
      sheet = parser.parse(data, "utf-8");
      expect(sheet.performer).to.be('Frank Boeijen');
      expect(sheet.title).to.be('Palermo');
      expect(sheet.files.length).to.be(10);
    });

    it('parse: Frank Boeijen Groep - Welkom In Utopia', function () {
      const data = fs.readFileSync(path.join(cueDir, 'Frank Boeijen Groep - Welkom In Utopia.eac.cue'));
      sheet = parser.parse(data, "utf-8");
      expect(sheet.performer).to.be('Frank Boeijen Groep');
      expect(sheet.title).to.be('Welkom In Utopia');
      expect(sheet.files.length).to.be(11);
    });
  });

  describe('it should parse XLD generated CUE files', function () {

    it('parse: Putumayo Presents - Yoga Lounge', function () {
      const data = fs.readFileSync(path.join(cueDir, 'Putumayo Presents - Yoga Lounge.xld.cue'));
      sheet = parser.parse(data, "utf-8");
      expect(sheet.files.length).to.be(12);

      const file_track_1 = sheet.files[0];
      expect(file_track_1.tracks.length).to.be(1);
      expect(file_track_1.tracks[0].title).to.be('Dreamcatcher');
      expect(file_track_1.tracks[0].performer).to.be('Bahramji & Maneesh De Moor');
    });
  });

  describe('Support text encoding', function () {

    it('should be able to decode "UTF-8"', function () {
      const data = fs.readFileSync(path.join(cueDir, 'Putumayo Presents Café Del Mundo.cue'));
      sheet = parser.parse(data, "utf-8");

      expect(sheet.encoding).to.be('utf-8');

      const file_track_7 = sheet.files[6];
      expect(file_track_7.tracks.length).to.be(1);
      expect(file_track_7.tracks[0].number).to.be(7);
      expect(file_track_7.name).to.be('07 Hèmlè.flac')
    });

    it('should be able to decode "ISO-8859-1"', function () {
      const data = fs.readFileSync(path.join(cueDir, 'Paco de Lucía - Fuente y Caudal.eac.cue'));
      sheet = parser.parse(data, "iso-8859-1");

      expect(sheet.encoding).to.be('windows-1252');

      expect(sheet.files.length).to.be(8);

      const file_track_4 = sheet.files[3];
      expect(file_track_4.tracks.length).to.be(1);
      expect(file_track_4.tracks[0].number).to.be(4);
      expect(file_track_4.tracks[0].title).to.be('Solera (Bulería por Soleá)');
      expect(file_track_4.tracks[0].performer).to.be('Paco de Lucía');
    });

  });

  describe('issue #22', function () {

    it('Michael Kiwanuka - Love And Hate"', () => {
      const data = fs.readFileSync(path.join(cueDir, 'Michael Kiwanuka - Love And Hate.cue'));
      sheet = parser.parse(data, "iso-8859-1");

      expect(sheet.encoding).to.be('windows-1252');
      expect(sheet.performer).to.be('Michael Kiwanuka');
      expect(sheet.title).to.be('Love And Hate');
      expect(sheet.files.length).to.be(1);
      const tracks = sheet.files[0].tracks;
      expect(tracks.length).to.be(10);
    });

    it('Schiller - Day and Night.cue', () => {
      const data = fs.readFileSync(path.join(cueDir, 'Schiller - Day and Night.cue'));
      sheet = parser.parse(data, "iso-8859-1");

      expect(sheet.encoding).to.be('windows-1252');
      expect(sheet.performer).to.be('Schiller');
      expect(sheet.title).to.be('Day and Night');

      expect(sheet.files.length).to.be(1);
      const tracks = sheet.files[0].tracks;
      expect(tracks.length).to.be(18);
    });

    it('Schiller - Zeitreise - Das Beste Von Schiller 1.cue', () => {
      const data = fs.readFileSync(path.join(cueDir, 'Schiller - Zeitreise - Das Beste Von Schiller 1.cue'));
      sheet = parser.parse(data, "iso-8859-1");

      expect(sheet.encoding).to.be('windows-1252');
      expect(sheet.performer).to.be('Schiller');
      expect(sheet.title).to.be('Zeitreise - Das Beste Von Schiller');

      expect(sheet.files.length).to.be(1);
      const tracks = sheet.files[0].tracks;
      expect(tracks.length).to.be(18);
    });

  });

});
