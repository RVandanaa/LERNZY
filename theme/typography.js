const fontFamily = {
  heading: 'BeVietnamPro',
  headingBold: 'BeVietnamPro-Bold',
  headingSemiBold: 'BeVietnamPro-SemiBold',
  body: 'PublicSans',
  bodyBold: 'PublicSans-Bold',
};

export const typography = {
  displayLg: {
    fontFamily: fontFamily.headingBold,
    fontSize: 40,
    fontWeight: '700',
    lineHeight: 48,
    letterSpacing: -0.5,
  },
  headlineMd: {
    fontFamily: fontFamily.headingSemiBold,
    fontSize: 28,
    fontWeight: '600',
    lineHeight: 36,
    letterSpacing: -0.25,
  },
  titleMd: {
    fontFamily: fontFamily.headingSemiBold,
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
  },
  titleSm: {
    fontFamily: fontFamily.headingSemiBold,
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  bodyLg: {
    fontFamily: fontFamily.body,
    fontSize: 18,
    fontWeight: '400',
    lineHeight: 29,
  },
  bodyMd: {
    fontFamily: fontFamily.body,
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 26,
  },
  bodySm: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  labelCaps: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  caption: {
    fontFamily: fontFamily.body,
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 17,
  },
  captionSm: {
    fontFamily: fontFamily.body,
    fontSize: 10,
    fontWeight: '400',
    lineHeight: 14,
  },
  button: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
    letterSpacing: 0.2,
  },
};