import { ApiProperty, PickType } from "@nestjs/swagger";
import { IsIn, IsNotEmpty, IsString  } from "class-validator";

enum LikeValue {
    LIKE = 1,
    NOT_LIKE = 0,
  }
export class UpvoteCommentDto {
    @ApiProperty()
    @IsNotEmpty()
    commentId: number

    @ApiProperty({ description: 'Upvote comment', required: true,default: LikeValue.LIKE, enum: LikeValue })
    @IsNotEmpty()
    isLike: LikeValue = LikeValue.LIKE
}
