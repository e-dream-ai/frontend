import { Row } from "@/components/shared";
import { Anchor } from "@/components/shared";
import Container from "@/components/shared/container/container";
import { Section } from "@/components/shared/section/section";
import Text from "@/components/shared/text/text";
import { useTranslation } from "react-i18next";

const SECTION_ID = "terms-of-service";

export const TermsOfServicePage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Container>
      <h2>{t("page.terms_of_service.title")}</h2>
      <Section id={SECTION_ID}>
        <Row justifyContent="space-between" separator />
        <Text>
          <ol>
            <li>
              <b>Acceptance of Terms of Service</b>
              <ol type="a">
                <li>
                  These Terms of Service, which include our End User License
                  Agreement (&ldquo;EULA&rdquo;) govern your use of the e-dream
                  service, hereafter, &ldquo;The Service&rdquo;.
                </li>
                <li>
                  The user of the service may be referred to as
                  &ldquo;you&rdquo; or &ldquo;The User&rdquo;.
                </li>
                <li>
                  By using the service, you accept and agree to these Terms of
                  Service. If you do not agree to these Terms of Service, do not
                  use our service.
                </li>
                <li>
                  The service is provided by e-dream, inc, hereafter,
                  &ldquo;The Company&rdquo;.
                </li>
                <li>
                  Age Requirements: You must be at least 13 years old to use the
                  Service. If you are under 18, you represent that you have your
                  parent or guardian’s permission to use the Service. Please
                  have them read this Agreement with you.
                </li>
              </ol>
            </li>
            <li>
              <b>Changes to Terms of Service.</b> The company may, from time to
              time, change these Terms of Service. We will post announcements
              through social media and on{" "}
              <Anchor href="https://e-dream.ai/">e-dream.ai</Anchor> when we do
              so.
            </li>
            <li>
              <b>Communication Preferences.</b> You are required to give us a
              working email address to create an account, and give us permission
              to contact you with it. You may opt-out of receiving marketing
              emails.
            </li>
            <li>
              <b>Non-commercial Use Only</b>
              <ol type="a">
                <li>
                  You may access the service for personal, non-commercial use
                  only.
                </li>
                <li>We hope to make this an option in the future.</li>
              </ol>
            </li>
            <li>
              <b>No Guarantee of Operability</b>
              <ol type="a">
                <li>
                  The Company is not responsible if the software Does not run on
                  your computer. Reasons for this may range from your computer’s
                  operating system being incompatible with our software, your
                  computer not having enough disk space, networking problems and
                  your ISP, your security software preventing the storage of
                  files, or other unknown reasons. Regardless of the reason, the
                  company has no obligation to ensure that the playback client
                  system works for you, that it runs on your computer, or that
                  your operating system remains compatible with the client
                  software over time.
                </li>
                <li>
                  We may test and experiment with various aspects of our
                  service, or they may break. We reserve the right to, and by
                  using our service you agree that we may, include you in or
                  exclude you from these tests or service interruptions without
                  notice. We reserve the right in our sole and absolute
                  discretion to make changes from time to time and without
                  notice in how we offer and operate our service. Content may
                  get stuck in a loop or otherwise not display properly. We are
                  not liable for any malfunction or unexpected performance
                  interruption.
                </li>
              </ol>
            </li>
            <li>
              <b>Payments</b>
              <ol type="a">
                <li>
                  <b>Subscriptions</b>
                  <ol type="i">
                    <li>TBD</li>
                  </ol>
                </li>
                <li>
                  <b>Credits</b>
                  <ol type="i">
                    <li>TBD</li>
                  </ol>
                </li>
                <li>
                  <b>Creator Bonuses</b>
                  <ol type="i">
                    <li>TBD</li>
                  </ol>
                </li>
                <li>
                  <b>Billing</b>
                  <ol type="i">
                    <li>TBD</li>
                  </ol>
                </li>
              </ol>
            </li>
            <li>
              <b>Content Policy</b>
              <ol type="a">
                <li>
                  The following types of content are prohibited:
                  <ol type="i">
                    <li>
                      Discriminates against people (including skin color,
                      gender, sexual orientation and religion).
                    </li>
                    <li>Is harassing or contains non-consensual porn.</li>
                    <li>
                      Contains any logos, watermarks, bugs, titles, or credits.
                      Note: Title, artist, and other metadata can be displayed
                      onscreen by the playback software at the user’s direction,
                      and there are commands to open up the web page with all
                      the info for the content, including its attribution.
                    </li>
                  </ol>
                </li>
                <li>Prohibited content may not be uploaded to e-dream.</li>
                <li>
                  We define &ldquo;not safe for work&rdquo; (NSFW) as any
                  content that:
                  <ol type="i">
                    <li>Depicts violent behavior, or</li>
                    <li>
                      Is pornographic or contains sexually oriented nudity.
                    </li>
                  </ol>
                </li>
                <li>
                  NSFW content will not be shown to a user unless they have
                  opted-in to see it.
                </li>
                <li>NSFW content must be declared as such on upload.</li>
              </ol>
            </li>
            <li>
              <b>User Generated Content</b>
              <ol type="a">
                <li>
                  When a user uploads content to e-dream, they become a creator.
                </li>
                <li>
                  The user attests that the content is legal and the uploader
                  has the right to upload and publish it.
                </li>
                <li>
                  Uploading gives the company a license to distribute and
                  display the content in the system and publish the content for
                  marketing purposes. The license is worldwide, nonexclusive,
                  royalty-free, sublicensable and transferable. It includes
                  permission for the company to create derived works such as
                  changing resolution and re-encoding in different formats,
                  playing back at different speeds, mixing with other visuals,
                  and otherwise transforming for interactive display.
                </li>
                <li>
                  Uploading also grants each other user of the Service a
                  worldwide, non-exclusive, royalty-free license to access your
                  Content through the Service, and to use that Content,
                  including to reproduce, distribute, prepare derivative works,
                  display, and perform it, only as enabled by a feature of the
                  Service. For clarity, this license does not grant any rights
                  or permissions for a user to make use of your Content
                  independent of the Service.
                </li>
                <li>
                  The licenses granted by you continue for a commercially
                  reasonable period of time after you remove or delete your
                  Content from the Service. You understand and agree, however,
                  that the Company may retain, but not display, distribute, or
                  perform, server copies of your videos that have been removed
                  or deleted.
                </li>
                <li>
                  The company is not obligated to distribute or display any
                  uploaded content. The company may delete any content at its
                  sole discretion.
                </li>
                <li>
                  Uploaded content must respect the Content Policy, above.
                </li>
                <li>
                  The company reserves the right to edit the content to meet
                  these rules, for example by using blurring, cropping, and
                  generative fill to remove a logo or nudity.
                </li>
                <li>
                  If the content comes from another site, declare the source URL
                  and license that allows crossposting. Many websites such as
                  archive.org and youtube.com host creative commons licensed
                  content that we may legally download and then upload to
                  e-dream. You are encouraged to do this, and record the
                  original site.
                </li>
                <li>
                  Upload form has optional checkbox to give rights for others to
                  transform and create derived works by cross-licensing with
                  creative commons. Choices are none, CC0, CC-BY.
                </li>
              </ol>
            </li>
            <li>
              <b>Disclaimers of Warranties and Limitations on Liability</b>
              <ol type="a">
                <li>
                  THE SERVICE AND ALL CONTENT AND SOFTWARE ASSOCIATED THEREWITH,
                  OR ANY OTHER FEATURES OR FUNCTIONALITIES ASSOCIATED WITH THE
                  SERVICE, ARE PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS
                  AVAILABLE&rdquo; WITH ALL FAULTS AND WITHOUT WARRANTY OF ANY
                  KIND. THE COMPANY DOES NOT GUARANTEE, REPRESENT, OR WARRANT
                  THAT YOUR USE OF THE SERVICE WILL BE UNINTERRUPTED OR
                  ERROR-FREE.
                </li>
                <li>
                  TO THE EXTENT PERMISSIBLE UNDER APPLICABLE LAWS, IN NO EVENT
                  SHALL THE COMPANY OR ANY OF THEIR SHAREHOLDERS, DIRECTORS,
                  OFFICERS, EMPLOYEES OR LICENSORS BE LIABLE (JOINTLY OR
                  SEVERALLY) TO YOU FOR PERSONAL INJURY OR ANY SPECIAL,
                  INCIDENTAL, INDIRECT OR CONSEQUENTIAL DAMAGES OF ANY KIND, OR
                  ANY DAMAGES WHATSOEVER.
                </li>
                <li>
                  SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OF CERTAIN
                  WARRANTIES OR THE LIMITATION OR EXCLUSION OF LIABILITY FOR
                  CERTAIN TYPES OF DAMAGES. THEREFORE, SOME OF THE ABOVE
                  LIMITATIONS IN THIS SECTION MAY NOT APPLY TO YOU.
                </li>
                <li>
                  NOTHING IN THESE TERMS OF SERVICE SHALL AFFECT ANY
                  NON-WAIVABLE STATUTORY RIGHTS THAT APPLY TO YOU. If any
                  provision or provisions of these Terms of Service shall be
                  held to be invalid, illegal, or unenforceable, the validity,
                  legality and enforceability of the remaining provisions shall
                  remain in full force and effect.
                </li>
              </ol>
            </li>
            <li>
              <b>Governing Law</b>
              <ol type="a">
                <li>
                  If you are a resident of Brazil, these Terms of Service shall
                  be governed by and construed in accordance with the laws of
                  Brazil.
                </li>
                <li>
                  For all others, these shall be governed by and construed in
                  accordance with the laws of the state of New York, U.S.A.
                  without regard to conflict of laws provisions.
                </li>
                <li>
                  You may also be entitled to certain consumer protection rights
                  under the laws of your local jurisdiction.
                </li>
              </ol>
            </li>
            <li>
              <b>Use of Information Submitted.</b> The Company is free to use
              any comments, information, ideas, concepts, reviews, or techniques
              or any other material contained in any communication you may send
              to us (&ldquo;Feedback&rdquo;), including responses to
              questionnaires or through postings to the service, worldwide and
              in perpetuity without further compensation, acknowledgement or
              payment to you for any purpose whatsoever including, but not
              limited to, developing, manufacturing and marketing products and
              creating, modifying or improving the service.
            </li>
            <li>
              <b>Customer Support.</b> To find more information about our
              service and its features, or if you need assistance with your
              account, please visit our web site,{" "}
              <Anchor href="https://e-dream.ai/">e-dream.ai</Anchor> and if
              necessary, contact us from your verified account email address.
              The company does not provide live help desk service. You may find
              us on social media, but the company does not guarantee any
              response.
            </li>
            <li>
              <b>Arbitration Agreement.</b> Any dispute, claim or controversy
              arising out of or relating in any way to the service shall be
              determined by binding arbitration or in small claims court.
              Arbitration is more informal than a lawsuit in court. Arbitration
              uses a neutral arbitrator instead of a judge or jury, allows for
              more limited discovery than in court, and is subject to very
              limited review by courts.
            </li>
            <li>
              <b>Survival.</b> If any provision or provisions of these Terms of
              Service shall be held to be invalid, illegal, or unenforceable,
              the validity, legality and enforceability of the remaining
              provisions shall remain in full force and effect.
            </li>
          </ol>
        </Text>
      </Section>
    </Container>
  );
};

export default TermsOfServicePage;
