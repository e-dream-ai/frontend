import styled from "styled-components"

const StyledTable = styled.table`
  &, th, td {
    margin: 1rem;
    border: 1px solid ${(props) => props.theme.textBodyColor};
    border-collapse: collapse;
    padding: 0.4rem;
  }
`;

export const CcbyTable = () =>
  <StyledTable>
    <thead>
      <tr>
        <th>Feature</th>
        <th>Default License</th>
        <th>CC BY License</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Basic Hosting & Display</td>
        <td>Included - e-dream may re-encode & stream your Content to other users</td>
        <td>Included - same as default</td>
      </tr>
      <tr>
        <td>AI Training</td>
        <td>Not permitted</td>
        <td>Permitted - your Content may be used to train AI models</td>
      </tr>
      <tr>
        <td>User Remix & Derivative Use</td>
        <td>Not permitted outside standard viewing or service features</td>
        <td>Permitted - others may modify, re-share, and remix, as long as they credit you</td>
      </tr>
      <tr>
        <td>Commercial Use by Others</td>
        <td>Not permitted</td>
        <td>Permitted - provided they comply with CC BY attribution requirements</td>
      </tr>
      <tr>
        <td>Attribution</td>
        <td>Not required beyond normal display credits (username, etc.)</td>
        <td>Required - must credit the original creator</td>
      </tr>
      <tr>
        <td>Removal from Service</td>
        <td>Terminates license after a reasonable time (except backups)</td>
        <td>Same as default, but cannot retroactively revoke rights for pre-existing downloads/derivatives (license remains valid)</td>
      </tr>
    </tbody>
  </StyledTable>