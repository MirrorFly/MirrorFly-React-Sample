import React from "react";
import { SettingsHeder } from "../Settings";
import "./About.scss";

const PrivacyPolicy = (props) => {
  const { backToAbout } = props;
  return (
    <div className="setting-container">
      <div>
        <div className="settinglist">
          <SettingsHeder handleBackFromSetting={backToAbout} label={"Terms and Privacy Policy"} />
          <div className="setting-list-ul Details">
            <div className="content-block">
              <h3 className="subheading">Overview</h3>
              <p className="content">
                The website{" "}
                <a className="content-link" target="_blank" href="https://www.mirrorfly.com/" rel="noopener noreferrer">
                  www.mirrorfly.com
                </a>{" "}
                and all of its contents and services are powered by MirrorFly. In the whole of the below text, the term
                'You', 'Client' or 'User' all denotes the user or client who access the website (in any way) or uses the
                services of it in any level.
              </p>
              <p className="content">
                The following Terms and Conditions apply to and govern the usage of the whole of{" "}
                <a className="content-link" target="_blank" href="https://www.mirrorfly.com/" rel="noopener noreferrer">
                  www.mirrorfly.com
                </a>
                website and all of its content, services and products available through the website, including, but not
                limited to, the client area (collectively referred to as the Website). The 'Terms and Conditions'
                section is written by us with the motive of providing maximum possible clarity for points of
                understanding between the website's firm and the user of the website. However, we in no way provide
                assurance that this section would consist of answers and explanations for all questions in regards to
                Terms and Conditions. In case you don't find an answer to a question or demand to have more clarity on a
                particular point, you shall email to us.
              </p>
              <p className="content">
                By accepting to access or use any part of this website, you are assumed to have agreed to be bound by
                the Terms and Conditions of this Agreement. In case you do not agree to all the Terms and Conditions of
                this agreement, then you shall not access the Website or use any of its services.
              </p>
              <p className="content">The Website is suitable only to individuals who are at least 13 years old.</p>
            </div>
            <div className="divider"></div>
            <div className="content-block">
              <h3 className="subheading">Client Area Account</h3>
              <p className="content">
                You are solely responsible for maintaining the security of your client area account and for any kind of
                activity that occurs within the account. You are expected to notify MirrorFly immediately in case of any
                unauthorized uses of your account or any other breaches of security. MirrorFly will not be liable for
                any acts or omissions by You, including any damages of any kind incurred as a result of such acts or
                omissions
              </p>
            </div>
            <div className="divider"></div>
            <div className="content-block">
              <h3 className="subheading">Post Sales Support</h3>
              <p className="content">
                On an occasion, if the client has opened and meddled with the codes, we will take no responsibility to
                give technical help in any magnitude, in case any trouble shoots up. There is no guarantee that all
                product updates will be available for free of cost. MirrorFly reserves the right to charge or not to
                charge for the product updates it releases according to the nature of the update.
              </p>
              <p className="content">
                The product is sold in "as is basis" with functions/features as specified in the website and any claim
                stating that features/function missing or not "as expected" by the buyer or not like how it is found in
                other similar products/competitors will not be taken into consideration, and MirrorFly in no way will be
                liable for such claims.
              </p>
              <p className="content">
                {" "}
                All customization services of any magnitude will be charged accordingly and the client in no way possess
                the right to claim for free customization services citing to the payment he has done initially for the
                actual product or for a previously agreed customization task/project/functionality. In case of any rude
                or harsh behavior of a client towards any Support, Executive will lead to termination of post-sales
                services for the particular customer. Customers are expected to communicate with the Support Executive
                in a best-dignified manner and not use any form of inappropriate communication (includes profanity).
              </p>
              <p className="content">
                From the day of installation, the client will receive 30 days of free post-sales support. From the 31st
                day, the client will be charged for his support necessities. The support hours are between 10 AM to 6 PM
                IST (MON - FRI).
              </p>
            </div>
            <div className="divider"></div>
            <div className="content-block">
              <h3 className="subheading">Responsibility of Website Visitors</h3>
              <p className="content">
                By operating the Website, MirrorFly does not represent or imply that it endorses any or all of the
                contributed content, or that it believes such material to be accurate, useful or non-harmful. You are
                responsible for taking precautions as necessary to protect yourself and your computer systems from
                viruses, worms, Trojan horses, and other harmful or destructive content. In spite of its ethical
                measures, the Website might contain content that is offensive, indecent, or otherwise objectionable, as
                well as content containing technical inaccuracies, typographical mistakes, and other errors. MirrorFly
                disclaims any responsibility for any harm resulting from the use by visitors of the Website.
              </p>
              <p className="content">
                Intellectual Property MirrorFly, MirrorFly.com, MirrorFly logo and all other trademarks, service marks,
                graphics and logos used in connection with the products in MirrorFly.com are trademarks or registered
                trademarks of MirrorFly Pvt Ltd or MirrorFly licensors. Other trademarks, service marks, graphics and
                logos used in connection with the Website may be the trademarks of other third parties. Your use of the
                Website grants you no right or license to reproduce or otherwise use any of MirrorFly or third-party
                trademarks. As MirrorFly asks others to respect its intellectual property rights, it respects the
                intellectual property rights of others. If you believe that material located on or linked to by
                MirrorFly.com violates your copyright, you are encouraged to notify MirrorFly Pvt Ltd., in accordance
                with common DMCA policies. MirrorFly will respond to all such notices, including as required or
                appropriate by removing the infringing material or disabling all links to the infringing material. In
                the case of a visitor who may infringe or repeatedly infringes the copyrights or other intellectual
                property rights of MirrorFly or others, MirrorFly may, in its discretion, terminate or deny access to
                and use of the Website. In the case of such termination, MirrorFly will have no obligation to provide a
                refund of any amounts previously paid to MirrorFly.
              </p>
            </div>
            <div className="divider"></div>
            <div className="content-block">
              <h3 className="subheading">Changes</h3>
              <p className="content">
                MirrorFly reserves the right, at its sole discretion,to modify or replace any part of this Agreement. It
                is your responsibility to check this Agreement periodically for changes. Your continued use of or access
                to the Website following the posting of any changes to this Agreement constitutes acceptance of those
                changes. MirrorFly may also, in the future, offer new services and/or features through the Website
                (including, the release of new tools and resources). Such new features and/or services shall be subject
                to the terms and conditions of this Agreement.
              </p>
            </div>
            <div className="divider"></div>
            <div className="content-block">
              <h3 className="subheading">Termination</h3>
              <p className="content">
                MirrorFly may terminate your access to all or any part of the Website at any time, with or without
                cause, with or without notice, effective immediately.
              </p>
            </div>
            <div className="divider"></div>
            <div className="content-block">
              <h3 className="subheading">Disclaimer of Warranties</h3>
              <p className="content">
                The Website is provided "as is". MirrorFly and its suppliers and licensors hereby disclaim all
                warranties of any kind, express or implied, including, without limitation, the warranties of
                merchantability, fitness for a particular purpose and non-infringement. Neither MirrorFly nor its
                suppliers and licensors make any warranty that the Website will be error free or that access thereto
                will be continuous or uninterrupted. You understand that you download from, or otherwise obtain content
                or services through, the Website at your own discretion and risk.
              </p>
            </div>
            <div className="divider"></div>
            <div className="content-block">
              <h3 className="subheading">Limitation of Liability</h3>
              <p className="content">
                In no event will MirrorFly, or its suppliers or licensors, be liable with respect to any subject matter
                of this agreement under any contract, negligence, strict liability or other legal or equitable theory
                for (i) any special, incidental or consequential damages; (ii) the cost of procurement or substitute
                products or services; (iii) for interruption of use or loss or corruption of data; or (iv) for any
                amounts that exceed the fees paid by you to MirrorFly under this agreement during the twelve (12) month
                period prior to the cause of action. MirrorFly shall have no liability for any failure or delay due to
                matters beyond their reasonable control. The foregoing shall not apply to the extent prohibited by
                applicable law.
              </p>
            </div>
            <div className="divider"></div>
            <div className="content-block">
              <h3 className="subheading">General Representation and Warranty</h3>
              <p className="content">
                You represent and warrant that (i) your use of the Website will be in strict accordance with the
                MirrorFly Privacy Policy, with this Agreement and with all applicable laws and regulations (including
                without limitation any local laws or regulations in your country, state, city, or other governmental
                area, regarding online conduct and acceptable content, and including all applicable laws regarding the
                transmission of technical data exported from the United States or the country in which you reside) and
                (ii) your use of the Website will not infringe or misappropriate the intellectual property rights of any
                third party.
              </p>
            </div>
            <div className="divider"></div>
            <div className="content-block">
              <h3 className="subheading">Indemnification</h3>
              <p className="content">
                You agree to indemnify and hold harmless MirrorFly, its contractors, and its licensors, and their
                respective directors, officers, employees and agents from and against any and all claims and expenses,
                including attorney's fees, arising out of your use of the Website, including but not limited to your
                violation of this Agreement.
              </p>
            </div>
            <div className="divider"></div>
            <div className="content-block">
              <h3 className="subheading">MirrorFly End User License Agreement</h3>
              <p className="content">
                Hereafter, "Product" or "software" refers to the extension or other scripts that you buy, "Licensor"
                refers to MirrorFly, "License" refers to this document, and "Licensee" refers to the party that received
                this license after having downloaded the respective product and paying the required fee as determined by
                the Licensor. This License governs the use of the accompanying product, and your purchase and use of the
                product constitutes your acceptance of this License and all of its contents and stipulations.
              </p>
              <p className="content">
                THIS PRODUCT IS NEITHER A FREEWARE NOR SHAREWARE. IT IS A COMMERCIALLY LICENSED PRODUCT. IT MUST BE
                PURCHASED FROM THE LICENSOR FOR USE BY ANY INDIVIDUAL OR PARTY, AND IS SUBJECT TO THE FOLLOWING TERMS.
              </p>
            </div>
            <div className="divider"></div>
            <div className="content-block">
              <h3 className="subheading">Refusal Of Service And Business Relations</h3>
              <p className="content">
                MirrorFly reserves the right to cease support and/or terminate business relations in instances of libel,
                defamation, abuse, or harassment. MirrorFly will terminate all support and business relations in
                instances of software piracy. This includes, but is not limited to "cracked", "nulled", or otherwise
                unlicensed versions of MirrorFly scripts or plugins.
              </p>
            </div>
            <div className="divider"></div>
            <div className="content-block">
              <h3 className="subheading">Illegal Distribution</h3>
              <p className="content">
                If our product is found to be stolen, distributed without permission, illegally obtained, or if the
                users of this software are found to be breaching any of the terms herein, the Licensor has the
                unconditional right to prosecute them to the fullest extent of the law.
              </p>
            </div>
            <div className="divider"></div>
            <div className="content-block">
              <h3 className="subheading">Liabilities</h3>
              <p className="content">
                The Licensor, its management, or any of its employees, associates, or partners cannot be held liable for
                any damages that this Software may cause. As the Licensee and user of the Software, you agree to accept
                full liability for any damages, risk, and losses involved with or incurred by the use of the Software.
              </p>
              <p className="content">
                THE SERVICES OR SOFTWARE AND ALL ASSOCIATED MATERIALS AND SERVICES ARE PROVIDED SOLELY ON AN "AS-IS"
                BASIS WITH ABSOLUTELY NO WARRANTY OF FITNESS OR MERCHANTABILITY, EXPLICIT OR IMPLIED
              </p>
              <p className="content">
                Licensor shall not be responsible for, and shall not pay, any amount of incidental, consequential or
                other indirect damages, whether based on lost revenue or otherwise, regardless of whether Licensor was
                advised of the possibility of such losses in advance. In no event shall Licensor's liability hereunder
                exceed the number of license fees paid by Licensee, regardless of whether Licensee's claim is based on
                contract, tort, strict liability, product liability or otherwise. If any term of this Agreement is held
                by a court of competent jurisdiction to be invalid or unenforceable, then this Agreement, including all
                of the remaining terms, will remain in full force and effect as if such invalid or unenforceable term
                had never been included. This license must be left completely intact when this software is used, or
                copied for approved multi-user use. The Licensor reserves all rights not expressly granted to you in
                this license.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
