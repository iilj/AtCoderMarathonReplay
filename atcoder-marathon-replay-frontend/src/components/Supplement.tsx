import React from 'react';

export const Supplement: React.FC = () => (
  <>
    <h2>補足</h2>
    <p style={{ color: 'red' }}>
      パフォーマンスがβ版レーティングのままになっています．そのうち直します．
    </p>
    <p>
      以下のコンテストの問題に対する各ユーザの最終提出は，プレテスト得点が不明であるため，システムテストの得点に下記の倍率を掛けた値を用いています．
    </p>
    <ul>
      <li>
        <del>ahc001: 50 / 1000</del> →{' '}
        <a href="https://www.dropbox.com/s/rqrlprp0zoyi4di/result_ahc001.csv?dl=0">
          result_ahc001.csv
        </a>{' '}
        から Provisional Score を取り込みました．
      </li>
      <li>hokudai-hitachi2020: 16 / 200</li>
      <li>hokudai-hitachi2019-2: 30 / 100</li>
      <li>hokudai-hitachi2019-1: 30 / 100</li>
      <li>hokudai-hitachi2018: 15 / 100</li>
      <li>hokudai-hitachi2017-2: 30 / 150</li>
      <li>hokudai-hitachi2017-1: 30 / 150</li>
    </ul>
  </>
);
