import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-github2';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>('GITHUB_CLIENT_ID'),
      clientSecret: configService.get<string>('GITHUB_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GITHUB_CALLBACK_URL'),
      scope: ['user:email'],
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): any {
    console.log('GitHub validate called', {
      accessToken,
      refreshToken,
      emails: profile?.emails,
      displayName: profile?.displayName,
      username: profile?.username,
      raw: profile?._json,
    });

    // Defensive extraction: GitHub may return null for displayName and public email.
    const emails = profile?.emails;
    const displayName = profile?.displayName ?? profile?.username ?? profile?._json?.name ?? '';
    const nameParts = displayName ? displayName.split(' ') : [];
    const firstName = nameParts[0] ?? profile?.username ?? '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // emails array may be present, or email may be in profile._json.email (often null unless public)
    const email =
      emails && emails.length && emails[0].value
        ? emails[0].value
        : (profile?._json?.email ?? null);

    if (!email) {
      // Clear, actionable error: caller can catch this and prompt user for email or fetch via API
      return done(
        new Error(
          'No email available from GitHub profile. Ensure the user granted email access and scope includes user:email.',
        ),
      );
    }

    const user = {
      email,
      firstName,
      lastName,
      provider: 'github',
    };

    done(null, user);
  }
}
