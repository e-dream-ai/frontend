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
        <th>Basic License</th>
        <th>CC BY License</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Hosting & Interactive Display</td>
        <td>Included - the company may distribute your content to other users and transform it for interactive display</td>
        <td>Included - same as basic</td>
      </tr>
      <tr>
        <td>Generative AI Training</td>
        <td>Not permitted</td>
        <td>Permitted - your Content may be used to train generative models</td>
      </tr>
      <tr>
        <td>User Remix & Derivative Use</td>
        <td>Not permitted beyond interactive display in the service</td>
        <td>Permitted - others may modify, reshare, and remix, as long as they credit you</td>
      </tr>
      <tr>
        <td>Commercial Use by Others</td>
        <td>Not permitted</td>
        <td>Permitted - as long as they credit you</td>
      </tr>
      <tr>
        <td>Attribution</td>
        <td>Not required - interactive users may request showing credits</td>
        <td>Required - must credit the original creator</td>
      </tr>
      <tr>
        <td>Removal from Service</td>
        <td>Terminates license after a reasonable time (except backups)</td>
        <td>Same as basic but cannot retroactively revoke rights for pre-existing downloads/derivatives</td>
      </tr>
    </tbody>
  </StyledTable>