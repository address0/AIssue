package ssafy.aissue.common.exception.s3;

import ssafy.aissue.common.exception.BaseException;
import ssafy.aissue.common.exception.errorcode.S3ErrorCode;

public class S3UploadFailedException extends BaseException {
    public S3UploadFailedException() {
        super(S3ErrorCode.S3_IMAGE_UPLOAD_FAILED);
    }
}
