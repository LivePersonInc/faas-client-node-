import request from 'request-promise';
import { CsdsClient } from '../../src/helper/csdsClient';
import { promisify } from 'util';
const setTimeoutPromise = promisify(setTimeout);

jest.mock('request-promise');

const csdsApiResultQA = {
  baseURIs: [
    {
      service: 'foo',
      account: 'le4711',
      baseURI: 'foo.liveperson.net',
    },
    {
      service: 'bar',
      account: 'le4711',
      baseURI: 'bar.liveperson.net',
    },
  ],
};

const csdsApiResultProd = {
  baseURIs: [
    {
      service: 'foo',
      account: '4711',
      baseURI: 'foo.liveperson.net',
    },
    {
      service: 'bar',
      account: '4711',
      baseURI: 'bar.liveperson.net',
    },
  ],
};

const requestMock: jest.Mock<any> = request as any;

describe('CsdsClient', () => {
  afterEach(jest.clearAllMocks);
  describe('Success flows', () => {
    it('should get csds entry if it exists', async () => {
      requestMock.mockResolvedValueOnce(csdsApiResultQA);

      const csdsClient = new CsdsClient();

      const uri = await csdsClient.get('le4711', 'foo');

      expect(uri).toEqual('foo.liveperson.net');
    });

    it('should cache requests', async () => {
      requestMock.mockResolvedValue(csdsApiResultQA);

      const csdsClient = new CsdsClient();

      await csdsClient.get('le4711', 'foo');
      await csdsClient.get('le4711', 'bar');

      expect(requestMock).toBeCalledTimes(1);
    });

    it('should do request if cache expired', async () => {
      requestMock.mockResolvedValue(csdsApiResultProd);

      const csdsClient = new CsdsClient(1);

      await csdsClient.get('4711', 'foo');
      await setTimeoutPromise(2000);
      await csdsClient.get('4711', 'bar');

      expect(requestMock).toBeCalledTimes(2);
    });
  });

  describe('Unhappy flows', () => {
    it('should throw if domain can not be found', async () => {
      requestMock.mockResolvedValueOnce(csdsApiResultQA);

      const csdsClient = new CsdsClient();

      expect(csdsClient.get('fr4711', 'does-not-exist')).rejects.toMatchObject({
        message: 'Service "does-not-exist" could not be found',
        name: 'CSDSDomainNotFound',
      });
    });

    it('should throw if result is unexpected', async () => {
      requestMock.mockRejectedValueOnce(new Error('Whoops'));

      const csdsClient = new CsdsClient();

      expect(csdsClient.get('le4711', 'foo')).rejects.toMatchObject({
        message: 'Error while fetching CSDS entries: Whoops',
        name: 'CSDSFailure',
      });
    });

    it('should throw if response is empty', async () => {
      requestMock.mockReturnValueOnce([]);

      const csdsClient = new CsdsClient();

      expect(csdsClient.get('le4711', 'foo')).rejects.toMatchObject({
        message: expect.stringContaining('Service "foo" could not be found'),
        name: 'CSDSDomainNotFound',
      });
    });
  });
});
